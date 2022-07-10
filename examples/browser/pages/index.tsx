import dynamic from 'next/dynamic';

// Next does server side rendering and tries to import the Node variant of the lib
// So with dynamic import we can force the import to only happen client side and pick the right import
const Example = dynamic(() => import('../components/Example'), { ssr: false });

export default function Home() {
  return <Example />;
}
