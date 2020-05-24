import ParametricTypeError from '../ParametricTypeError';
import { ParseQueryConstructor, ResourceConstructor } from './parse';

async function getResourceUrls(filename: string, ...more: string[]): Promise<string[]> {
  const filenames = [filename, ...more];
  const resourceObjects = await new ParseQueryConstructor(ResourceConstructor)
    .containedIn('filename', filenames)
    .find();

  const fetchedFilenames = resourceObjects.map(
    (resourceObject) => resourceObject.attributes.filename
  );
  if (
    resourceObjects.length !== filenames.length ||
    new Set(fetchedFilenames).size !== filenames.length
  ) {
    throw new ParametricTypeError('Expected unique resource files', { fetchedFilenames });
  }

  return resourceObjects
    .map(({ attributes }) => {
      if (typeof attributes.filename !== 'string') {
        throw new ParametricTypeError('Expected valid URL from Resource Object', { attributes });
      }
      if (typeof attributes.url !== 'string') {
        throw new ParametricTypeError('Expected valid URL from Resource Object', { attributes });
      }

      return {
        filename: attributes.filename,
        url: attributes.url,
      };
    })
    .sort(
      (attributes, other) =>
        filenames.indexOf(attributes.filename) - filenames.indexOf(other.filename)
    )
    .map(({ url }) => url);
}

export default getResourceUrls;
