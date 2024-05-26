export enum API_METHOD {
  POST = 'POST',
  GET = 'GET',
}

export const ERROR_CODES = [500, 502, 400, 404]

export async function callApi(
  endpoint: string,
  method: API_METHOD,
  data: any
): Promise<any> {
  const backend = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT
  let url = `${backend}/${endpoint}`
  // const url = `http://localhost:8000/${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  }
  try {
    let response: any
    if (method === API_METHOD.POST) {
      response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Include the status code in the thrown Error
        const errorData = await response.json()
        const error = new Error(errorData.message || 'Something went wrong')
        ;(error as any).statusCode = response.status // Add the status code to the error object
        throw error
      }
    } else if (method === API_METHOD.GET) {
      const params = new URLSearchParams(data).toString()
      url += `?${params}`
      response = await fetch(url, {
        method,
        headers, // Headers for GET request might not need 'Content-Type' for some APIs
      })
    }

    return await response
  } catch (error) {
    throw error
  }
}
