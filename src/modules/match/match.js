import { Router } from 'express'
import { desc } from 'drizzle-orm'
import {
  createMatchSchema,
  listMatchesQuerySchema
} from '../../validation/matchValidation.js'
import { validateRequest } from '../../middleware/validateRequest.js'
import { db } from '../../db/db.js'
import { matchTable } from '../../db/schema.js'
import { getMatchStatus } from '../../utils/getMatchStatus.js'

const router = Router()
const MAX_LIMIT = 100

router.get('/', async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.query)

  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'Invalid query.', details: parsed.error.issues })
  }

  const limit = Math.min(parsed.data.limit ?? 50, MAX_LIMIT)

  try {
    const data = await db
      .select()
      .from(matchTable)
      .orderBy(desc(matchTable.createdAt))
      .limit(limit)

    res.json({ data })
  } catch (e) {
    res.status(500).json({ error: 'Failed to list matches.' })
  }
})

router.post('/', validateRequest(createMatchSchema), async (req, res) => {
  const { startTime, endTime, homeScore, awayScore, ...rest } = req.body

  try {
    const [match] = await db
      .insert(matchTable)
      .values({
        ...rest,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        homeScore: homeScore ?? 0,
        awayScore: awayScore ?? 0,
        status: getMatchStatus(startTime, endTime)
      })
      .returning()

    if (res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(match)
    }

    res.status(201).json({ match })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to create match.' })
  }
})

export const matchRoutes = router
