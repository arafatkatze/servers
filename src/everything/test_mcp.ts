import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ProgressNotificationSchema,
} from '@modelcontextprotocol/sdk/types.js'
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
        args: ["dist/index.js"],
    })

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

        console.log('\n=== Testing Notion Reader tool ===')
        const notion_response = await client.callTool({
            name: "echo",
            arguments: {
                message: "hello world"
            }
        });
        console.log('Notion Reader result:', JSON.stringify(notion_response, null, 2))

        // Clean up
        await client.close()

    } catch (error) {
        console.error('Error:', error)
    }
}

// Run the tests
main() 