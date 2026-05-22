import { useState } from 'react'
import { PhoneCall, UserPlus, Calendar, Clock, Check, Loader2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const CARETAKERS = [
  {
    name: 'Aarav Sharma',
    city: 'Mumbai',
    experience: '5 years',
    price: '₹450 / hour',
    phone: '+91 98234 56789',
    description: 'Experienced elder care assistant with medication support skills.'
  },
  {
    name: 'Sanya Patel',
    city: 'Ahmedabad',
    experience: '4 years',
    price: '₹420 / hour',
    phone: '+91 98765 43210',
    description: 'Compassionate caregiver for daily routines and mobility help.'
  },
  {
    name: 'Rohan Verma',
    city: 'Delhi',
    experience: '6 years',
    price: '₹500 / hour',
    phone: '+91 98123 45670',
    description: 'Specialized in post-surgery assistance and elder patient care.'
  },
  {
    name: 'Priya Singh',
    city: 'Bengaluru',
    experience: '3 years',
    price: '₹400 / hour',
    phone: '+91 99012 34567',
    description: 'Friendly caretaker focused on companionship and wellness support.'
  },
  {
    name: 'Ananya Rao',
    city: 'Hyderabad',
    experience: '7 years',
    price: '₹520 / hour',
    phone: '+91 99456 78901',
    description: 'Reliable and calm caregiver with good medical monitoring experience.'
  },
  {
    name: 'Vikram Desai',
    city: 'Pune',
    experience: '5 years',
    price: '₹480 / hour',
    phone: '+91 98877 66554',
    description: 'Patient-focused caregiver for elderly assistance and mobility.'
  },
  {
    name: 'Meera Nair',
    city: 'Kochi',
    experience: '4 years',
    price: '₹430 / hour',
    phone: '+91 99654 32109',
    description: 'Trusted caretaker for daily living support and medicine reminders.'
  },
  {
    name: 'Aditya Kapoor',
    city: 'Chandigarh',
    experience: '5 years',
    price: '₹470 / hour',
    phone: '+91 98111 22334',
    description: 'Experienced in helping seniors with rehab and daily care.'
  },
  {
    name: 'Shreya Joshi',
    city: 'Nagpur',
    experience: '3 years',
    price: '₹410 / hour',
    phone: '+91 97222 33445',
    description: 'Kind and responsive caretaker for gentle, personal support.'
  },
  {
    name: 'Karan Mehta',
    city: 'Jaipur',
    experience: '6 years',
    price: '₹490 / hour',
    phone: '+91 96543 21098',
    description: 'Dependable care professional for emergency support and caregiving.'
  },
  {
    name: 'Nikhil Gowda',
    city: 'Mandya',
    experience: '4 years',
    price: '₹430 / hour',
    phone: '+91 98450 12345',
    description: 'Skilled caregiver for elder assistance and emergency response.'
  },
  {
    name: 'Deepa Reddy',
    city: 'Mandya',
    experience: '5 years',
    price: '₹460 / hour',
    phone: '+91 99006 54321',
    description: 'Compassionate caretaker offering reliable day and night support.'
  },
  {
    name: 'Rahul Kulkarni',
    city: 'Kanpur',
    experience: '5 years',
    price: '₹475 / hour',
    phone: '+91 98102 33456',
    description: 'Attentive support specialist experienced in elderly care.'
  },
  {
    name: 'Priyanka Deshmukh',
    city: 'Pune',
    experience: '4 years',
    price: '₹445 / hour',
    phone: '+91 98765 67890',
    description: 'Friendly helper skilled in personal care and medication reminders.'
  }
]

export function Caretakers() {
  const [sortOrder, setSortOrder] = useState<'city-asc' | 'city-desc'>('city-asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCaretaker, setSelectedCaretaker] = useState<any | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('')
  const [bookingHours, setBookingHours] = useState('2')
  const [isBooking, setIsBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const filteredCaretakers = CARETAKERS.filter((caretaker) => {
    const query = searchQuery.trim().toLowerCase()
    return (
      caretaker.city.toLowerCase().includes(query) ||
      caretaker.name.toLowerCase().includes(query)
    )
  })

  const sortedCaretakers = [...filteredCaretakers].sort((a, b) => {
    return sortOrder === 'city-asc'
      ? a.city.localeCompare(b.city)
      : b.city.localeCompare(a.city)
  })

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen space-y-8">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="glass-panel rounded-3xl border border-border-subtle bg-slate-950/80 p-8 shadow-black/20 shadow-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-neon/30 bg-brand-neon/5 px-4 py-2 text-sm font-semibold text-brand-neon">
            <UserPlus size={18} /> Emergency Caretaker Support
          </p>
          <h1 className="mt-6 text-5xl font-extrabold text-white leading-tight">Book a caretaker by city in seconds</h1>
          <p className="mt-4 text-text-secondary max-w-2xl text-lg leading-relaxed">
            If an emergency happens, search caregivers by city or name and connect instantly. Each profile shows location, contact, hourly price, and experience.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-[#11131B] p-5 border border-white/5">
              <p className="text-sm text-text-muted uppercase tracking-[0.2em]">Available caretakers</p>
              <p className="mt-3 text-3xl font-bold text-white">10</p>
            </div>
            <div className="rounded-3xl bg-[#11131B] p-5 border border-white/5">
              <p className="text-sm text-text-muted uppercase tracking-[0.2em]">Emergency-ready</p>
              <p className="mt-3 text-3xl font-bold text-white">Fast connect</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="glass-panel rounded-3xl border border-border-subtle bg-slate-950/90 p-5 shadow-black/10">
            <label className="block text-sm font-semibold text-white mb-3">Search by city or caretaker name</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="e.g. Mumbai, Delhi, Priya"
              className="w-full rounded-3xl border border-border-subtle bg-[#090A10] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-neon focus:ring-2 focus:ring-brand-neon/10"
            />
          </div>
          <div className="glass-panel rounded-3xl border border-border-subtle bg-slate-950/90 p-5 shadow-black/10">
            <label className="block text-sm font-semibold text-white mb-3">Sort by city</label>
            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value as 'city-asc' | 'city-desc')}
              className="w-full rounded-3xl border border-border-subtle bg-[#090A10] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-neon focus:ring-2 focus:ring-brand-neon/10"
            >
              <option value="city-asc">City A → Z</option>
              <option value="city-desc">City Z → A</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sortedCaretakers.length === 0 ? (
          <div className="glass-panel rounded-3xl border border-border-subtle bg-slate-950/80 p-8 text-center text-white">
            <p className="text-xl font-bold">No caretakers matched your search.</p>
            <p className="mt-2 text-text-secondary">Try another city or caretaker name to see nearby support options.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedCaretakers.map((caretaker) => (
              <motion.article
                key={caretaker.phone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="glass-panel rounded-3xl border border-border-subtle bg-slate-950/90 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.18)] hover:-translate-y-1 hover:border-brand-neon/40 transition-all"
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm text-brand-neon uppercase tracking-[0.32em] font-bold">Caretaker</p>
                    <h2 className="text-2xl font-extrabold text-white mt-3">{caretaker.name}</h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary">{caretaker.city}</span>
                      <span className="rounded-full bg-brand-neon/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-neon">{caretaker.experience}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-text-secondary">Price</p>
                    <p className="text-3xl font-extrabold text-white mt-2">{caretaker.price}</p>
                  </div>
                </div>

                <p className="mt-6 text-text-secondary leading-relaxed">{caretaker.description}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setSelectedCaretaker(caretaker);
                      setBookingSuccess(false);
                      // Set default booking date to tomorrow
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setBookingDate(tomorrow.toISOString().split('T')[0]);
                      setBookingTime("10:00");
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-3xl bg-brand-neon px-4 py-3 text-sm font-bold text-black transition-all hover:bg-white"
                  >
                    Book Caretaker
                  </button>
                  <a
                    href={`tel:${caretaker.phone}`}
                    className="inline-flex items-center justify-center gap-2 rounded-3xl border border-border-subtle hover:border-white px-4 py-3 text-sm font-bold text-white transition-all bg-[#090A10]"
                  >
                    <PhoneCall size={16} /> Connect ({caretaker.phone})
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel rounded-3xl border border-border-subtle p-6 bg-[#11131B]/80">
        <h3 className="text-xl font-bold text-white mb-3">How to use this page</h3>
        <ul className="space-y-3 text-text-secondary list-disc list-inside">
          <li>Choose a caretaker and press <span className="font-semibold text-white">Connect</span> to call instantly.</li>
          <li>Keep the number ready so support is available during an emergency.</li>
          <li>Prices are shown per hour for quick comparison.</li>
        </ul>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedCaretaker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass-panel rounded-3xl border border-border-subtle bg-slate-950/95 p-8 shadow-2xl"
            >
              <button
                onClick={() => {
                  setSelectedCaretaker(null);
                  setBookingSuccess(false);
                }}
                className="absolute top-6 right-6 text-text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {bookingSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                    <Check size={32} />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Booking Confirmed!</h3>
                  <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                    You have booked <span className="text-brand-neon font-bold">{selectedCaretaker.name}</span> for {bookingHours} hours on {bookingDate} at {bookingTime}.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCaretaker(null);
                      setBookingSuccess(false);
                    }}
                    className="w-full py-3.5 bg-brand-neon hover:bg-white text-black font-extrabold rounded-2xl transition-all"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsBooking(true);
                    // Simulate booking network request
                    await new Promise((resolve) => setTimeout(resolve, 1500));
                    setIsBooking(false);
                    setBookingSuccess(true);
                  }}
                  className="space-y-6 text-left"
                >
                  <div>
                    <p className="text-xs text-brand-neon uppercase tracking-[0.25em] font-bold">Emergency Caretaker Booking</p>
                    <h3 className="text-2xl font-extrabold text-white mt-1">Book {selectedCaretaker.name}</h3>
                    <p className="text-text-secondary text-xs mt-1">Hourly rate: {selectedCaretaker.price}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Select Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="date"
                          required
                          value={bookingDate}
                          onChange={(e) => setBookingDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full rounded-2xl border border-border-subtle bg-[#090A10] pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-brand-neon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Select Start Time</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                          type="time"
                          required
                          value={bookingTime}
                          onChange={(e) => setBookingTime(e.target.value)}
                          className="w-full rounded-2xl border border-border-subtle bg-[#090A10] pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-brand-neon"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-text-secondary mb-2">Duration (Hours)</label>
                      <select
                        value={bookingHours}
                        onChange={(e) => setBookingHours(e.target.value)}
                        className="w-full rounded-2xl border border-border-subtle bg-[#090A10] px-4 py-3 text-sm text-white outline-none focus:border-brand-neon"
                      >
                        <option value="1">1 Hour</option>
                        <option value="2">2 Hours</option>
                        <option value="4">4 Hours</option>
                        <option value="8">8 Hours</option>
                        <option value="12">12 Hours (Half Day)</option>
                        <option value="24">24 Hours (Full Day)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full py-4 bg-brand-neon hover:bg-white text-black font-extrabold rounded-2xl transition-all flex justify-center items-center gap-2"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="animate-spin" size={18} /> Booking Caretaker...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
