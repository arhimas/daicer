export async function pMap(iterable: any[], mapper: (item: any) => Promise<any>, options: { concurrency: number }) {
  const results: any[] = [];
  const executing: Promise<any>[] = [];
  for (const item of iterable) {
    const p = mapper(item).then((res) => results.push(res));
    executing.push(p);
    const clean = () => executing.splice(executing.indexOf(p), 1);
    p.then(clean).catch(clean);
    if (executing.length >= options.concurrency) {
      await Promise.race(executing);
    }
  }
  await Promise.all(executing);
  return results;
}
