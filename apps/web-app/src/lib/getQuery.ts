export const getQuery = (q: string | string[] | undefined) => {
  return Array.isArray(q) ? q[0] : q;
};
