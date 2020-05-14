import { nanoid } from 'nanoid';
import { useState } from 'react';

function useUniqueId() {
  const [id] = useState(nanoid);
  return id;
}

export default useUniqueId;
