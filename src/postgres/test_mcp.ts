import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

const DB_URL = "postgresql://postgres:postgres@localhost:5433/postgres"

async function createClient(): Promise<Client> {
    const client = new Client(
        {
            name: 'mcp-tester',
            version: '0.0.1',
        },
        {
            capabilities: {
                experimental: {},
                sampling: {},
                roots: {},
                tools: {list: true},
            },
        },
    )

    // Connect to the server via STDIO
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js", DB_URL],
    })
    console.log('Transport:', transport)

    await client.connect(transport)
    console.log('Connected to MCP server fully')

    const serverInfo = await client.getServerVersion()
    console.log('The Server info:', serverInfo)
    // Handle progress notifications
    // client.setNotificationHandler(ProgressNotificationSchema, notification => {
    //     console.log('Progress:', notification)
    // })
    return client
}

async function main() {
    try {
        const client = await createClient()

        console.log('\n=== Testing postgres server ===')
        
        // Test listing resources (tables)
        const resources = await client.listResources()
        console.log('Available tables:', JSON.stringify(resources, null, 2))

        // Test reading schema for the first resource
        if (resources.resources.length > 0) {
            const firstResource = resources.resources[0]
            console.log(`\nReading schema for: ${firstResource.name}`)
            const schema = await client.readResource({ uri: firstResource.uri })
            console.log('Schema:', JSON.stringify(schema, null, 2))
        }

        // Test listing available tools
        const tools = await client.listTools()
        console.log('\nAvailable tools:', JSON.stringify(tools, null, 2))

        // Test running some SQL queries
        console.log('\n=== Testing SQL queries ===')
        
        // Test listing tables
        const tablesQuery = await client.callTool({
            name: 'query',
            arguments: {
                sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
            }
        })
        console.log('\nTables in public schema:', JSON.stringify(tablesQuery, null, 2))

        // // Test getting PostgreSQL version
        const versionQuery = await client.callTool({
            name: 'query',
            arguments: {
                sql: 'SELECT version()'
            }
        })
        console.log('\nPostgreSQL version:', JSON.stringify(versionQuery, null, 2))

        // // Test error handling with invalid SQL
        // try {
        //     await client.callTool({
        //         name: 'query',
        //         arguments: {
        //             sql: 'SELECT * FROM nonexistent_table'
        //         }
        //     })
        // } catch (error) {
        //     console.log('\nExpected error from invalid query:', error)
        // }

        // // Clean up
        await client.close()
        console.log('\nTests completed successfully')

    } catch (error) {
        console.error('Error:', error)
        process.exit(1)
    }
}

// Run the tests
main() 