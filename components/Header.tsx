import Image from 'next/image';
import SignOut from './SignOut';

export default function Header() {
  return (
    <div className='container border-b mx-auto px-4 md:px-6 lg:px-8 fixed top-0 bg-blue-500 z-50 '>
      <header className='flex h-16 w-full lg:w-screen  bg-blue-500 shrink-0 items-center  '>
        <div className='mr-6 flex '>
          <Image
            src={'/assets/logo-bg.png'}
            alt={`Shekhar Enterprise logo`}
            width={40}
            height={40}
            className='rounded-full '
          />
          {/* <h3 className='mx-3 text-xl font-bold text-foreground text-white hidden sm:block'>Shekhar Enterprises</h3>        </div> */}
        </div>
        <SignOut />
      </header>
    </div>
  );
}
