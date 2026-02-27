import { createRxDatabase, type RxDatabase, type RxCollection, type RxJsonSchema } from 'rxdb'
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie'

export type AttendanceStatus = 'present' | 'absent_excused' | 'absent_unexcused'

export interface AttendanceDocType {
  id: string
  enrollment_id: string
  date: string
  status: AttendanceStatus
  marked_by_profile_id: string
  synced_at: string | null
  created_at: string
  updated_at: string
}

const attendanceSchema: RxJsonSchema<AttendanceDocType> = {
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 36 },
    enrollment_id: { type: 'string', maxLength: 36 },
    date: { type: 'string', maxLength: 10 },
    status: {
      type: 'string',
      enum: ['present', 'absent_excused', 'absent_unexcused'],
    },
    marked_by_profile_id: { type: 'string', maxLength: 36 },
    synced_at: { type: ['string', 'null'], maxLength: 30 },
    created_at: { type: 'string', maxLength: 30 },
    updated_at: { type: 'string', maxLength: 30 },
  },
  required: ['id', 'enrollment_id', 'date', 'status', 'marked_by_profile_id', 'created_at', 'updated_at'],
  indexes: ['date', 'enrollment_id'],
}

export type AttendanceCollection = RxCollection<AttendanceDocType>

export type DatabaseCollections = {
  attendance: AttendanceCollection
}

export type AppDatabase = RxDatabase<DatabaseCollections>

let dbPromise: Promise<AppDatabase> | null = null

export async function getDatabase(): Promise<AppDatabase> {
  if (dbPromise) return dbPromise

  dbPromise = createRxDatabase<DatabaseCollections>({
    name: 'spor_akademisi_db',
    storage: getRxStorageDexie(),
    multiInstance: false,
    ignoreDuplicate: true,
  }).then(async (db) => {
    await db.addCollections({
      attendance: { schema: attendanceSchema },
    })
    return db
  })

  return dbPromise
}
