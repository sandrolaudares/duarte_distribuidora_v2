import {
  sqliteTable,
  text,
  integer,
  blob,
  // customType,
} from 'drizzle-orm/sqlite-core'
import { userTable } from '../user'
import { timestamps } from '../../utils'

const imageTable = sqliteTable('image', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  ...timestamps,
  uploaded_by: text('uploaded_by')
    // .notNull()
    .references(() => userTable.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  data: blob('data', { mode: 'buffer' }).notNull(),
})

type SelectImage = typeof imageTable.$inferSelect
type InsertImage = typeof imageTable.$inferInsert
export { imageTable, type SelectImage, type InsertImage }
