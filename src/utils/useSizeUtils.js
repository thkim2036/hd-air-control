export const fitHeightOfElement = (el, minHeight, padding) => {
  const viewport = window.innerHeight
  const footer = 0
  const location = el.getBoundingClientRect().top
  const height = viewport - (footer + location + padding)
  if (height < minHeight) {
    return minHeight
  }
  
  return height
}
