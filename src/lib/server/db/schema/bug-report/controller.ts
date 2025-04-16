import { desc, eq } from 'drizzle-orm'
import { userTable } from '../user'
import {
  bugReportTable,
  type InsertBugReport,
  type SelectBugReport,
  logsTable,
  type InsertLogs,
} from '$db/schema'
import type { TenantDbType, Transaction } from '../../tenant'

export const bugReport = (db: TenantDbType | Transaction) => ({
  insertBugReport(report: InsertBugReport) {
    return db
      .insert(bugReportTable)
      .values({
        text: report.text,
        created_by: report.created_by,
        status: 'TODO',
        metadata: report.metadata,
      })
      .returning({
        id: bugReportTable.id,
      })
  },

  updateBugReportStatus(
    id: SelectBugReport['id'],
    status: SelectBugReport['status'],
  ) {
    return db
      .update(bugReportTable)
      .set({
        status: status,
      })
      .where(eq(bugReportTable.id, id))
  },

  getBugReports() {
    return db
      .select({
        id: bugReportTable.id,
        text: bugReportTable.text,
        status: bugReportTable.status,
        created_at: bugReportTable.created_at,
        created_by_name: userTable.username,
        metadata: bugReportTable.metadata,
      })
      .from(bugReportTable)
      .leftJoin(userTable, eq(bugReportTable.created_by, userTable.id))
  },

  insertLogs(log: InsertLogs) {
    return db.insert(logsTable).values(log)
  },

  getLogs() {
    return db
      .select({
        id: logsTable.id,
        created_at: logsTable.created_at,
        text: logsTable.text,
        metadata: logsTable.metadata,
        error: logsTable.error,
        user_name: userTable.username,
      })
      .from(logsTable)
      .leftJoin(userTable, eq(logsTable.created_by, userTable.id))
      .limit(5)
      .orderBy(desc(logsTable.created_at))
  },

  allLogs() {
    return db
      .select({
        id: logsTable.id,
        created_at: logsTable.created_at,
        text: logsTable.text,
        metadata: logsTable.metadata,
        error: logsTable.error,
        type: logsTable.type,
        pathname: logsTable.pathname,
        routeName: logsTable.routeName,
        currency: logsTable.currency,

        user_name: userTable.username,
      })
      .from(logsTable)
      .leftJoin(userTable, eq(logsTable.created_by, userTable.id))
  },
})
