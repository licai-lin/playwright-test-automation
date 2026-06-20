import { expect, test } from "@playwright/test";

test("GET a single post from JSONPlaceholder API", async ({ request }) => {
  // 1. Send a GET request to the API endpoint.
  const response = await request.get("https://jsonplaceholder.typicode.com/posts/1");

  // 2. Check that the API request was successful.
  expect(response.status()).toBe(200);
  expect(response.ok()).toBeTruthy();

  // 3. Convert the response body from JSON text into a JavaScript object.
  const responseBody = await response.json();

  // 4. Check the important fields in the response.
  expect(responseBody.id).toBe(1);
  expect(responseBody.userId).toBe(1);
  expect(responseBody.title).toBeTruthy();
  expect(responseBody.body).toBeTruthy();
});

test("POST a new post to JSONPlaceholder API", async ({ request }) => {
  // 1. Prepare the data that we want to send to the API.
  const newPost = {
    title: "My first API test",
    body: "This post was created from a Playwright API test.",
    userId: 1,
  };

  // 2. Send a POST request with the new post data.
  const response = await request.post("https://jsonplaceholder.typicode.com/posts", {
    data: newPost,
  });

  // 3. Check that the API created the resource.
  expect(response.status()).toBe(201);
  expect(response.ok()).toBeTruthy();

  // 4. Convert the response body into a JavaScript object.
  const responseBody = await response.json();

  // 5. Check that the response contains the data we sent.
  expect(responseBody.title).toBe(newPost.title);
  expect(responseBody.body).toBe(newPost.body);
  expect(responseBody.userId).toBe(newPost.userId);

  // JSONPlaceholder returns a fake ID for created posts.
  expect(responseBody.id).toBeTruthy();
});
