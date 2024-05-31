/**
 * A Least Recently Used (LRU) cache with Time-to-Live (TTL) support. Items are kept in the cache until they either
 * reach their TTL or the cache reaches its size and/or item limit. When the limit is exceeded, the cache evicts the
 * item that was least recently accessed (based on the timestamp of access). Items are also automatically evicted if they
 * are expired, as determined by the TTL.
 * An item is considered accessed, and its last accessed timestamp is updated, whenever `has`, `get`, or `set` is called with its key.
 *
 * Implement the LRU cache provider here and use the lru-cache.test.ts to check your implementation.
 * You're encouraged to add additional functions that make working with the cache easier for consumers.
 */

type LRUCacheProviderOptions = {
  ttl: number // Time to live in milliseconds
  itemLimit: number
}
type LRUCacheProvider<T> = {
  has: (key: string) => boolean
  get: (key: string) => T | undefined
  set: (key: string, value: T) => void
}

type Node <T> = {
  key: string,
  value: T,
  prev: Node<T> | null,
  next: Node<T> | null,
  expiresAt: number
}

// TODO: Implement LRU cache provider
export function createLRUCacheProvider<T>({
  ttl,
  itemLimit,
}: LRUCacheProviderOptions): LRUCacheProvider<T> {
  let cache : Map <string, Node<T>> = new Map();
  let head: Node<T> | null = null;
  let tail: Node<T> | null = null;

  const moveToTail = (node: Node<T>) => {
    if (node === tail) return;
    if (node === head) {
      head = node.next;
    }
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    if (tail){
      tail.next = node;
    }
    node.prev = tail;
    node.next = null;
    tail = node;
    if (!head) {
      head = node;
    }
  }

  const removeHead = () => {
    if (!head) return;
    cache.delete(head.key);
    if (head.next) {
      head.next.prev = null;
    }
    head = head.next;
    if (!head){
      tail = null;
    }
  }

  const get = (key: string): T | undefined => {
    const node = cache.get(key);
    if (!node) return undefined;
    if (Date.now() > node.expiresAt){
      cache.delete(key);
    }
    moveToTail(node);
    return node.value;
  }

  const set = (key: string, value: T) => {
    let node = cache.get(key);
    const now = Date.now();
    const expiresAt = now + ttl;
    if (node){
      node.value = value;
      node.expiresAt = expiresAt;
      moveToTail(node);
    } else {
      node = {key, value, prev: tail, next: null, expiresAt}
      if (tail) {
        tail.next = node;
      }
      tail = node;
      if (!head){
        head = node;
      }
      cache.set(key, node);
      if (cache.size > itemLimit) {
        removeHead();
      }
    }
  }

  const has = (key: string): boolean => {
    const node = cache.get(key);
    if (!node) {
      return false;
    } else {
      if (Date.now() > node.expiresAt){
        cache.delete(key);
        return false;
      }
      node.expiresAt = Date.now() + ttl;
      moveToTail(node);
      return true;
    }
  }

  return {
    has,
    get,
    set,
  }
}
