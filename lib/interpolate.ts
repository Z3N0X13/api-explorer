export function interpolate(
  text: string,
  variables: Record<string, string>,
): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    return variables[key.trim()] ?? `{{${key}}}`;
  });
}

export function interpolateRequest(
  url: string,
  headers: { key: string; value: string }[],
  body: string,
  variables: Record<string, string>,
) {
  return {
    url: interpolate(url, variables),
    headers: headers.map((h) => ({
      ...h,
      value: interpolate(h.value, variables),
    })),
    body: interpolate(body, variables),
  };
}
