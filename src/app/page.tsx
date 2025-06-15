import { AppHeader } from '@/components/app-header';
import SightReaderClientPage from '@/components/sight-reader-client-page';

export default function Home() {
  return (
    <>
      <AppHeader />
      <main className="flex-1">
        <SightReaderClientPage />
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with ❤️ for accessibility. SightReader &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </>
  );
}
