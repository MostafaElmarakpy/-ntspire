export interface ExpectedResponse {
  path: string;
  status: number;
  received: boolean;
}

export function getMissingResponseErrors(expectations: ExpectedResponse[]): string[] {
  return expectations
    .filter((expectation) => !expectation.received)
    .map(({ path, status }) => `expected response { path: "${path}", status: ${status} } did not occur`);
}
