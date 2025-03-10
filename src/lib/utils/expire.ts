export function differenceInDays(expireAt: Date): number {
    const today = new Date()
    const expirationDate = new Date(expireAt)

    today.setHours(0, 0, 0, 0)
    expirationDate.setHours(0, 0, 0, 0)

    const timeDifference = expirationDate.getTime() - today.getTime()
    const dayDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24))

    return dayDifference
  }

  export function getBgColor(expireAt: Date) {
    const daysDiff = differenceInDays(expireAt)
    console.log(daysDiff)

    if (daysDiff < 0) {
      return 'badge badge-md badge-error text-red-50'
    } else if (daysDiff <= 4) {
      return 'badge badge-md badge-warning text-yellow-50'
    } else if (daysDiff <= 7) {
      return ''
    }
    return ' '
  }