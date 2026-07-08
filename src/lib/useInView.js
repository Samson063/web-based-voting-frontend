import { useEffect, useRef, useState } from 'react'

/**
 * useInView — returns true once the element enters the viewport.
 * Use it to trigger animations when sections scroll into view.
 *
 * Usage:
 *   const [ref, visible] = useInView()
 *   <div ref={ref} className={visible ? 'animate-fade-in-up' : 'opacity-0'}>...</div>
 */
export default function useInView(options = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect() // fire once only
        }
      },
      { threshold: 0.15, ...options }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}
