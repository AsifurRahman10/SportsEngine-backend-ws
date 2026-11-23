import { Router } from 'express'
import { matchIdParamSchema } from '../../validation/matchValidation.js'
import {
  createCommentarySchema,
  listCommentaryQuerySchema
} from '../../validation/commentaryValidation.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { db } from '../../db/db.js'
import { commentaryTable } from '../../db/schema.js'
import { desc, eq } from 'drizzle-orm'

const router = Router({ mergeParams: true })

const MAX_LIMIT = 100

router.get('/', async (req, res) => {
  const paramsResult = matchIdParamSchema.safeParse(req.params)

  if (!paramsResult.success) {
    return res
      .status(400)
      .json({ error: 'Invalid match ID.', details: paramsResult.error.issues })
  }

  const queryResult = listCommentaryQuerySchema.safeParse(req.query)
  if (!queryResult.success) {
    return res.status(400).json({
      error: 'Invalid query parameters.',
      details: queryResult.error.issues
    })
  }

  try {
    const { id: matchId } = paramsResult.data
    const { limit = 10 } = queryResult.data

    const safeLimit = Math.min(limit, MAX_LIMIT)

    const results = await db
      .select()
      .from(commentaryTable)
      .where(eq(commentaryTable.matchId, matchId))
      .orderBy(desc(commentaryTable.createdAt))
      .limit(safeLimit)

    res.status(200).json({ data: results })
  } catch (error) {
    console.error('Failed to fetch commentary:', error)
    res.status(500).json({ error: 'Failed to fetch commentary.' })
  }
})

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
