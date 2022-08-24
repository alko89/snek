module.exports = class Data1659963484462 {
  name = 'Data1659963484462'

  async up(db) {
    await db.query(`CREATE TABLE "asset_entity" ("id" character varying NOT NULL, "name" text, "symbol" text, "decimals" integer, CONSTRAINT "PK_038b7b28b83db2205747ef9912e" PRIMARY KEY ("id"))`)
  }

  async down(db) {
    await db.query(`DROP TABLE "asset_entity"`)
  }
}
