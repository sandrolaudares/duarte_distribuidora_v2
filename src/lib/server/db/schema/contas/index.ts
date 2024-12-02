/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    sqliteTable,
    text,
    integer,
    // customType,
  } from 'drizzle-orm/sqlite-core'
  
import { timestamps } from '../../utils'
export const customerTable = sqliteTable('cliente', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    ...timestamps,
    
  })
