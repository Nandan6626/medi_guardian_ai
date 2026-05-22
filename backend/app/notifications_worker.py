import asyncio
import logging
import time as time_module
from datetime import datetime, time, timedelta
import json
from sqlalchemy import text
from app.database import AsyncSessionLocal

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notifications_worker")

def parse_time_str(time_str: str) -> time:
    time_str = time_str.strip().upper()
    for fmt in ("%H:%M:%S", "%H:%M", "%I:%M %p", "%I:%M%p", "%H:%M %p"):
        try:
            return datetime.strptime(time_str, fmt).time()
        except ValueError:
            continue
    # Fallback to simple split
    try:
        parts = time_str.split(":")
        h = int(parts[0])
        m = int(parts[1])
        return time(h, m)
    except Exception:
        raise ValueError(f"Unknown time format: {time_str}")

async def check_medication_schedules(session):
    now = datetime.now()
    today = now.date()
    start_of_today = datetime.combine(today, time.min)

    # 1. Query clinical schedules
    schedules_query = text("""
        SELECT ms.id, ms.patient_id, ms.medicine_name, ms.dosage, ms.timing_slots, 
               pp.user_id as patient_user_id, pp.first_name as patient_first_name
        FROM medicine_schedules ms
        JOIN patient_profiles pp ON ms.patient_id = pp.id
        WHERE ms.status = 'ACTIVE'
    """)
    schedules = await session.execute(schedules_query)
    schedules = schedules.fetchall()

    for ms in schedules:
        schedule_id = ms.id
        patient_id = ms.patient_id
        medicine_name = ms.medicine_name
        dosage = ms.dosage
        timing_slots_raw = ms.timing_slots
        patient_user_id = ms.patient_user_id
        patient_first_name = ms.patient_first_name or "Patient"

        if not patient_user_id:
            continue

        # Parse timing slots
        slots = []
        if isinstance(timing_slots_raw, list):
            slots = timing_slots_raw
        elif isinstance(timing_slots_raw, str):
            try:
                slots = json.loads(timing_slots_raw)
            except Exception:
                slots = [timing_slots_raw]
        else:
            continue

        for slot in slots:
            if not slot:
                continue
            try:
                parsed_time = parse_time_str(str(slot))
            except Exception as e:
                logger.warning(f"Failed to parse slot time '{slot}': {e}")
                continue

            scheduled_dt = datetime.combine(today, parsed_time)
            scheduled_ts = scheduled_dt.timestamp()
            now_ts = time_module.time()

            # Check for live alarm (due in the current reminder window)
            if scheduled_ts <= now_ts < scheduled_ts + 120:
                # Check if alarm already exists for today
                body = f"⏰ It is time to take your {medicine_name} ({dosage})!"
                alarm_exists_query = text("""
                    SELECT id FROM notifications
                    WHERE user_id = :user_id
                      AND title = 'Medication Alarm'
                      AND body = :body
                      AND created_at >= :start_of_today
                """)
                res = await session.execute(alarm_exists_query, {
                    "user_id": patient_user_id,
                    "body": body,
                    "start_of_today": start_of_today
                })
                if not res.fetchone():
                    logger.info(f"Triggering medication alarm for patient {patient_first_name} (Med: {medicine_name})")
                    insert_alarm_query = text("""
                        INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                        VALUES (:user_id, 'SYSTEM', 'Medication Alarm', :body, 'MEDIUM', false, :now)
                    """)
                    await session.execute(insert_alarm_query, {
                        "user_id": patient_user_id,
                        "body": body,
                        "now": now
                    })
                    await session.commit()

            # Check for 15-minute overdue escalation
            time_diff = now - scheduled_dt
            if time_diff >= timedelta(minutes=15) and time_diff < timedelta(hours=2):
                # Check if any log exists in medicine_logs for this slot
                slot_start = scheduled_dt - timedelta(minutes=2)
                slot_end = scheduled_dt + timedelta(minutes=2)
                log_exists_query = text("""
                    SELECT id FROM medicine_logs
                    WHERE schedule_id = :schedule_id
                      AND scheduled_time >= :slot_start
                      AND scheduled_time <= :slot_end
                """)
                res = await session.execute(log_exists_query, {
                    "schedule_id": schedule_id,
                    "slot_start": slot_start,
                    "slot_end": slot_end
                })
                if not res.fetchone():
                    # Insert Missed log
                    logger.info(f"Escalating missed dose for patient {patient_first_name} (Med: {medicine_name})")
                    insert_log_query = text("""
                        INSERT INTO medicine_logs (schedule_id, patient_id, scheduled_time, status, logged_by)
                        VALUES (:schedule_id, :patient_id, :scheduled_time, 'MISSED', 'SYSTEM_AUTO')
                    """)
                    await session.execute(insert_log_query, {
                        "schedule_id": schedule_id,
                        "patient_id": patient_id,
                        "scheduled_time": scheduled_dt
                    })

                    # Insert warning for patient
                    patient_warning_body = f"⚠️ You missed your scheduled dose of {medicine_name} ({dosage}) at {slot}."
                    insert_warning_query = text("""
                        INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                        VALUES (:user_id, 'MISSED_MEDICINE', 'Missed Dose Warning', :body, 'HIGH', false, :now)
                    """)
                    await session.execute(insert_warning_query, {
                        "user_id": patient_user_id,
                        "body": patient_warning_body,
                        "now": now
                    })

                    # Query connected caregivers
                    caregivers_query = text("""
                        SELECT connected_user_id FROM patient_connections
                        WHERE patient_id = :patient_id
                          AND status = 'ACTIVE'
                          AND connection_type = 'CAREGIVER'
                    """)
                    caregivers_res = await session.execute(caregivers_query, {"patient_id": patient_id})
                    caregivers = caregivers_res.fetchall()

                    for cg in caregivers:
                        cg_user_id = cg.connected_user_id
                        if not cg_user_id:
                            continue
                        logger.info(f"Notifying caregiver {cg_user_id} about missed dose of {patient_first_name}")
                        caregiver_body = f"🚨 Escalation: {patient_first_name} has missed their scheduled dose of {medicine_name} ({dosage}) at {slot}."
                        insert_cg_query = text("""
                            INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                            VALUES (:user_id, 'MISSED_MEDICINE', 'Loved One Missed Dose Escalation', :body, 'CRITICAL', false, :now)
                        """)
                        await session.execute(insert_cg_query, {
                            "user_id": cg_user_id,
                            "body": caregiver_body,
                            "now": now
                        })
                    
                    await session.commit()

async def check_self_reminders(session):
    now = datetime.now()
    today = now.date()
    start_of_today = datetime.combine(today, time.min)

    # 2. Query self reminders
    reminders_query = text("""
        SELECT r.id, r.patient_id, r.medicine_name, r.dosage, r.reminder_time, 
               pp.user_id as patient_user_id, pp.first_name as patient_first_name
        FROM reminders r
        JOIN patient_profiles pp ON r.patient_id = pp.id
    """)
    reminders = await session.execute(reminders_query)
    reminders = reminders.fetchall()

    for r in reminders:
        reminder_id = r.id
        patient_id = r.patient_id
        medicine_name = r.medicine_name
        dosage = r.dosage
        reminder_time_raw = r.reminder_time
        patient_user_id = r.patient_user_id
        patient_first_name = r.patient_first_name or "Patient"

        if not patient_user_id or not reminder_time_raw:
            continue

        try:
            parsed_time = parse_time_str(str(reminder_time_raw))
        except Exception as e:
            logger.warning(f"Failed to parse reminder time '{reminder_time_raw}': {e}")
            continue

        scheduled_dt = datetime.combine(today, parsed_time)
        scheduled_ts = scheduled_dt.timestamp()
        now_ts = time_module.time()

        # Check for live alarm (due in the current reminder window)
        if scheduled_ts <= now_ts < scheduled_ts + 120:
            body = f"⏰ It is time to take your {medicine_name} ({dosage})!"
            alarm_exists_query = text("""
                SELECT id FROM notifications
                WHERE user_id = :user_id
                  AND title = 'Medication Alarm'
                  AND body = :body
                  AND created_at >= :start_of_today
            """)
            res = await session.execute(alarm_exists_query, {
                "user_id": patient_user_id,
                "body": body,
                "start_of_today": start_of_today
            })
            if not res.fetchone():
                logger.info(f"Triggering medication alarm for patient {patient_first_name} (Med: {medicine_name})")
                insert_alarm_query = text("""
                    INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                    VALUES (:user_id, 'SYSTEM', 'Medication Alarm', :body, 'MEDIUM', false, :now)
                """)
                await session.execute(insert_alarm_query, {
                    "user_id": patient_user_id,
                    "body": body,
                    "now": now
                })
                await session.commit()

        # Check for 15-minute overdue escalation for self reminders
        time_diff = now - scheduled_dt
        if time_diff >= timedelta(minutes=15) and time_diff < timedelta(hours=2):
            slot_start = scheduled_dt - timedelta(minutes=2)
            slot_end = scheduled_dt + timedelta(minutes=2)
            log_exists_query = text("""
                SELECT id FROM medicine_logs
                WHERE schedule_id = :schedule_id
                  AND scheduled_time >= :slot_start
                  AND scheduled_time <= :slot_end
            """)
            res = await session.execute(log_exists_query, {
                "schedule_id": reminder_id, # Reminders map their logs by matching schedule_id = reminder_id
                "slot_start": slot_start,
                "slot_end": slot_end
            })
            if not res.fetchone():
                logger.info(f"Escalating missed self reminder dose for patient {patient_first_name} (Med: {medicine_name})")
                # Insert Missed log
                insert_log_query = text("""
                    INSERT INTO medicine_logs (schedule_id, patient_id, scheduled_time, status, logged_by)
                    VALUES (:schedule_id, :patient_id, :scheduled_time, 'MISSED', 'SYSTEM_AUTO')
                """)
                await session.execute(insert_log_query, {
                    "schedule_id": reminder_id,
                    "patient_id": patient_id,
                    "scheduled_time": scheduled_dt
                })

                # Insert warning for patient
                patient_warning_body = f"⚠️ You missed your scheduled dose of {medicine_name} ({dosage}) at {reminder_time_raw}."
                insert_warning_query = text("""
                    INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                    VALUES (:user_id, 'MISSED_MEDICINE', 'Missed Dose Warning', :body, 'HIGH', false, :now)
                """)
                await session.execute(insert_warning_query, {
                    "user_id": patient_user_id,
                    "body": patient_warning_body,
                    "now": now
                })

                # Query connected caregivers
                caregivers_query = text("""
                    SELECT connected_user_id FROM patient_connections
                    WHERE patient_id = :patient_id
                      AND status = 'ACTIVE'
                      AND connection_type = 'CAREGIVER'
                """)
                caregivers_res = await session.execute(caregivers_query, {"patient_id": patient_id})
                caregivers = caregivers_res.fetchall()

                for cg in caregivers:
                    cg_user_id = cg.connected_user_id
                    if not cg_user_id:
                        continue
                    logger.info(f"Notifying caregiver {cg_user_id} about missed self reminder of {patient_first_name}")
                    caregiver_body = f"🚨 Escalation: {patient_first_name} has missed their scheduled dose of {medicine_name} ({dosage}) at {reminder_time_raw}."
                    insert_cg_query = text("""
                        INSERT INTO notifications (user_id, type, title, body, priority, is_read, created_at)
                        VALUES (:user_id, 'MISSED_MEDICINE', 'Loved One Missed Dose Escalation', :body, 'CRITICAL', false, :now)
                    """)
                    await session.execute(insert_cg_query, {
                        "user_id": cg_user_id,
                        "body": caregiver_body,
                        "now": now
                    })
                
                await session.commit()

async def notifications_worker_loop():
    logger.info("Starting notifications worker loop...")
    while True:
        try:
            async with AsyncSessionLocal() as session:
                await check_medication_schedules(session)
                await check_self_reminders(session)
        except Exception as e:
            logger.error(f"Error in notifications worker: {e}", exc_info=True)
        await asyncio.sleep(30)
