import { eq } from 'drizzle-orm'

import { type InsertImage, imageTable, type SelectImage } from '.'

import sharp from 'sharp'
import type { TenantDbType, Transaction } from '../../tenant'

export const image = (db: TenantDbType |Transaction) => ({
  insertImage: async function insertImage(img: {
    buff: Buffer
    name: string
    uploaded_by: InsertImage['uploaded_by']
  }) {
    const processedImage = await sharp(img.buff)
      .resize({ width: 400, height: 400, fit: 'cover' })
      .toBuffer()

    return await db
      .insert(imageTable)
      .values({
        name: img.name,
        data: processedImage,
        uploaded_by: img.uploaded_by,
      })
      .returning({
        img_id: imageTable.id,
      })
  },
  updateImage: async function (
    imageID: SelectImage['id'],
    img: Partial<InsertImage>,
  ) {
    return await db
      .update(imageTable)
      .set(img)
      .where(eq(imageTable.id, imageID))
      .run()
  },

  getImageByID: function getImageByID(id: SelectImage['id']) {
    return db
      .select({
        img: imageTable.data,
      })
      .from(imageTable)
      .where(eq(imageTable.id, id))
      .limit(1)
  },
  getImagesFromUser: function (userID: string) {
    return db
      .select({
        img: imageTable.data,
      })
      .from(imageTable)
      .where(eq(imageTable.uploaded_by, userID))
  },
})
