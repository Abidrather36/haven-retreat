import sql from 'mssql/msnodesqlv8';

async function test() {
    try {
        const connectionString = "Server=(local);Database=master;Trusted_Connection=yes;Driver={ODBC Driver 17 for SQL Server};";
        
        // Pass string directly to connect
        await sql.connect(connectionString);
        console.log("Connected successfully using mssql with raw string!");
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e.message);
        process.exit(1);
    }
}
test();
