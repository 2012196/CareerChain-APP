const { Client } = require("pg")
require('dotenv').config()

async function cleanDB() {
  const client = new Client(process.env.DATABASE_URL)
  await client.connect()

  const activity = await client.query('DELETE FROM public."Activity"')
  console.log(activity.rowCount)

  const awardCert = await client.query('DELETE FROM public."AwardedCertificate"')
  console.log(awardCert.rowCount)

  const certs = await client.query('DELETE FROM public."Certificate"')
  console.log(certs.rowCount)

  const awardPoints = await client.query('DELETE FROM public."AwardedPoints"')
  console.log(awardPoints.rowCount)

  const addedEmp = await client.query('DELETE FROM public."Employees"')
  console.log(addedEmp.rowCount)

  await client.end()
}

cleanDB()