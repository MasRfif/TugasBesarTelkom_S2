import React from 'react'
import { MessageSquareText, Star, UserRound, Quote, BarChart3 } from 'lucide-react'

function clampRating(value) {
  const n = Number(value || 0)
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(5, n))
}

export function RatingStars({ value = 0, size = 15 }) {
  const rating = clampRating(value)

  return (
    <div className="rating-stars" aria-label={`Rating ${rating} dari 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= Math.round(rating) ? 'rating-star active' : 'rating-star'}
        />
      ))}
    </div>
  )
}

export default function TestimonialSection({
  title = 'Testimoni Warga',
  subtitle = 'Ulasan dan rating dari warga yang mengikuti acara di The Village.',
  items = [],
  summary = null,
  maxItems = 6,
}) {
  const visibleItems = (items || []).slice(0, maxItems)
  const avgRating = Number(summary?.avg_rating || 0)
  const totalRating = Number(summary?.rating_count || visibleItems.length || 0)

  return (
    <section className="testimonial-section">
      <div className="section-head testimonial-head">
        <div>
          <div className="section-kicker">
            <MessageSquareText size={15} /> Penilaian Acara
          </div>
          <h2 className="section-title">{title}</h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        <div className="rating-summary-card">
          <div className="rating-summary-icon">
            <BarChart3 size={18} />
          </div>
          <div>
            <div className="rating-summary-score">
              {avgRating > 0 ? avgRating.toFixed(1) : '0.0'}
            </div>
            <RatingStars value={avgRating} />
            <div className="rating-summary-text">{totalRating} penilaian</div>
          </div>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="testimonial-empty card">
          <MessageSquareText size={26} />
          <div>
            <h3>Belum ada testimoni</h3>
            <p>Testimoni akan tampil setelah warga memberi ulasan pada acara.</p>
          </div>
        </div>
      ) : (
        <div className="testimonial-grid">
          {visibleItems.map((item, index) => {
            const rating = Number(item.rate || item.rating || 0)
            const name = item.nama_user || item.nama_lengkap || item.nama_awal || 'Warga Desa'

            return (
              <article className="testimonial-card" key={`${item.id_feedback || item.id_rating || index}-${index}`}>
                <div className="testimonial-quote-icon">
                  <Quote size={17} />
                </div>
                <div className="testimonial-top">
                  <div className="testimonial-avatar">
                    <UserRound size={17} />
                  </div>
                  <div>
                    <h3>{name}</h3>
                    {item.nama_event && <p>{item.nama_event}</p>}
                  </div>
                </div>

                <RatingStars value={rating} />

                <p className="testimonial-text">
                  {item.text || item.ulasan || 'Warga memberikan penilaian baik untuk acara ini.'}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
