// Import the Supabase client using ES6 syntax
import { createClient } from "@supabase/supabase-js";
import { UsersTable } from "./config.js";

// Initialize the Supabase client
const supabase = createClient(
  UsersTable.SUPABASE_URL,
  UsersTable.SUPERBASE_USERS
);

async function fetchData() {
  // Fetch only Password and Mail_ID columns from Users_details table
  const { data, error } = await supabase
    .from("users_details")
    .select("password, mail_Id");

  if (error) {
    console.error("Error fetching data:", error);
    return;
  }

  console.log("Fetched data:", data);
}

// Call the function to test it
fetchData();
