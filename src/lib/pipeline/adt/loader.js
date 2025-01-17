import adt from 'blizzardry/lib/ADT';
import { DecodeStream } from 'blizzardry/lib/restructure';

import Loader from '../../net/loader';

const loader = new Loader();

export default function(path, wdtFlags) {
  return loader.load(path).then((raw) => {
    const buffer = new Buffer(new Uint8Array(raw));
    const stream = new DecodeStream(buffer);
    const data = adt(wdtFlags).decode(stream);
    return data;
  });
}
