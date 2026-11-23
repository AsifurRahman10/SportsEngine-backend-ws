export const validateRequest = (zodSchema) => {
  return (req, res, next) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data)
    }
    const parseData = zodSchema.safeParse(req.body)
    if (!parseData.success) {
      next(parseData.error)
    }
    req.body = parseData.data
    next()
  }
}
