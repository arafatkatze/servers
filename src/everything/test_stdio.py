import json
import subprocess
import sys
import time

def send_message(process, message):
    # Add JSON-RPC required fields
    json_rpc_message = {
        "jsonrpc": "2.0",
        "id": 1,
        **message  # Include the original message
    }
    
    print(f"\nSending message: {json.dumps(json_rpc_message, indent=2)}")
    
    # Send message to stdin
    process.stdin.write(json.dumps(json_rpc_message) + "\n")
    process.stdin.flush()
    
    # Read response from stdout
    print("Waiting for response...")
    response = process.stdout.readline()
    if not response:
        print("No response received!")
        return None
    
    print(f"Raw response: {response}")
    return json.loads(response)

def main():
    print("Starting Node.js server...")
    
    # Start the Node.js process
    process = subprocess.Popen(
        ["node", "dist/index.js"],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    try:
        print("\n=== Testing echo tool ===")
        # response = send_message(process, {
        #     "method": "tools/call",
        #     "params": {
        #         "name": "echo",
        #         "arguments": {
        #             "message": "Hello, MCP!"
        #         }
        #     }
        # })
        # if response:
        #     print("\nEcho result:", json.dumps(response, indent=2))

        # Test tools/list
        print("\n=== Testing tools/list ===")
        response = send_message(process, {
            "method": "tools/list",
            "params": {}
        })
        if response:
            print("\nAvailable tools:", json.dumps(response, indent=2))

        # Then test add tool
        # print("\n=== Testing add tool ===")
        # response = send_message(process, {
        #     "method": "tools/call",
        #     "params": {
        #         "name": "add",
        #         "arguments": {
        #             "a": 5,
        #             "b": 3
        #         }
        #     }
        # })
        if response:
            print("\nAdd result:", json.dumps(response, indent=2))

    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        print("\nShutting down server...")
        process.terminate()
        process.wait(timeout=2)

if __name__ == "__main__":
    main() 