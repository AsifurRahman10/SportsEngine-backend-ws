import { Router } from 'express'
import { matchIdParamSchema } from '../../validation/matchValidation.js'
import { createCommentarySchema } from '../../validation/commentaryValidation.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { db } from '../../db/db.js'
import { commentaryTable } from '../../db/schema.js'

const router = Router({ mergeParams: true })

router.post('/', validateRequest(createCommentarySchema), async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params)

  if (!paramsResult.success) {
    return res.status(400).json({
      error: 'Invalid match ID.',
      details: paramsResult.error.issues
    })
  }
  try {
    const [result] = await db
      .insert(commentaryTable)
      .values({
        ...req.body,
        matchId: paramsResult.data.id
      })
      .returning()
    if (res.app.locals.broadcastCommentary) {
      res.app.locals.broadcastCommentary(result.matchId, result)
    }
    res.status(201).json({ data: result })
  } catch (error) {
    console.error('Failed to create commentary:', error)
    res.status(500).json({ error: 'Failed to create commentary.' })
  }
})

export const commentaryRouter = router
