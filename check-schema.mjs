import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '.env.local')

const env = fs.readFileSync(envPath, 'utf8').split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=')
  if (key && value) acc[key.trim()] = value.trim()
  return acc
}, {})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSchema() {
  console.log('Checking Supabase tables...')
  
  // Try to query common tables
  const tables = ['products', 'orders', 'waitlist', 'settings']
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*', { count: 'exact', head: true })
    if (error) {
      console.log(`❌ Table "${table}" does not exist or error:`, error.message)
    } else {
      console.log(`✅ Table "${table}" exists!`)
    }
  }
}

checkSchema()
