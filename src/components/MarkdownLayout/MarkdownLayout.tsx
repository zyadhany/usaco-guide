import { graphql, useStaticQuery } from 'gatsby';
import * as React from 'react';
import { useContext, useState } from 'react';
import {
  moduleIDToSectionMap,
  moduleIDToURLMap,
} from '../../../content/ordering';
import ConfettiContext from '../../context/ConfettiContext';
import { ContactUsSlideoverProvider } from '../../context/ContactUsSlideoverContext';
import MarkdownLayoutContext from '../../context/MarkdownLayoutContext';
import { ProblemSolutionContext } from '../../context/ProblemSolutionContext';
import { ProblemSuggestionModalProvider } from '../../context/ProblemSuggestionModalContext';
import { useUserLangSetting } from '../../context/UserDataContext/properties/simpleProperties';
import {
  useSetProgressOnModule,
  useUserProgressOnModules,
} from '../../context/UserDataContext/properties/userProgress';
import { ModuleInfo } from '../../models/module';
import { SolutionInfo } from '../../models/solution';
import ForumCTA from '../ForumCTA';
import DesktopSidebar from './DesktopSidebar';
import MobileAppBar from './MobileAppBar';
import MobileSideNav from './MobileSideNav';
import ModuleHeaders from './ModuleHeaders/ModuleHeaders';
import ModuleProgressUpdateBanner from './ModuleProgressUpdateBanner';
import NavBar from './NavBar';
import NotSignedInWarning from './NotSignedInWarning';
import TableOfContentsBlock from './TableOfContents/TableOfContentsBlock';
import TableOfContentsSidebar from './TableOfContents/TableOfContentsSidebar';

const ContentContainer = ({ children, tableOfContents }) => (
  <main
    className="relative pt-6 lg:pt-2 focus:outline-none overflow-x-hidden"
    tabIndex={0}
  >
    <div className="mx-auto">
      <div className="flex justify-center">
        {/* Placeholder for the sidebar */}
        <div
          className="flex-shrink-0 hidden lg:block order-1"
          style={{ width: '20rem' }}
        />
        {tableOfContents.length > 1 && (
          <div className="hidden 2xl:block ml-6 mr-6 w-64 mt-48 flex-shrink-0 order-3">
            <TableOfContentsSidebar tableOfContents={tableOfContents} />
          </div>
        )}
        <div className="flex-1 max-w-4xl px-4 sm:px-6 lg:px-8 w-0 min-w-0 order-2 overflow-x-auto">
          <div className="hidden lg:block">
            <NavBar />
            <div className="h-8" />
          </div>

          {children}

          <div className="pt-4 pb-6">
            <NavBar alignNavButtonsRight={false} />
          </div>
        </div>
      </div>
    </div>
  </main>
);

export default function MarkdownLayout({
  markdownData,
  children,
}: {
  markdownData: ModuleInfo | SolutionInfo;
  children: React.ReactNode;
}) {
  const userProgressOnModules = useUserProgressOnModules();
  const setModuleProgress = useSetProgressOnModule();
  const lang = useUserLangSetting();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const moduleProgress =
    (userProgressOnModules && userProgressOnModules[markdownData.id]) ||
    'Not Started';

  const tableOfContents =
    lang in markdownData.toc ? markdownData.toc[lang] : markdownData.toc['cpp'];

  const data = useStaticQuery(graphql`
    query {
      allXdm(filter: { fileAbsolutePath: { regex: "/content/" } }) {
        nodes {
          frontmatter {
            title
            id
          }
        }
      }
    }
  `);
  const moduleLinks = React.useMemo(() => {
    return data.allXdm.nodes.map(cur => ({
      id: cur.frontmatter.id,
      title: cur.frontmatter.title,
      section: moduleIDToSectionMap[cur.frontmatter.id],
      url: moduleIDToURLMap[cur.frontmatter.id],
    }));
  }, [data.allXdm]);
  const showConfetti = useContext(ConfettiContext);
  const handleCompletionChange = progress => {
    if (moduleProgress === progress) return;
    setModuleProgress(markdownData.id, progress);
    if (
      moduleProgress !== 'Complete' &&
      (progress === 'Practicing' || progress === 'Complete')
    ) {
      showConfetti!();
    }
  };

  // problemSolutionContext is null when markdownData is a ModuleInfo
  const problemSolutionContext = useContext(ProblemSolutionContext);
  let activeIDs: string[] = [];
  if (markdownData instanceof ModuleInfo) {
    activeIDs.push(markdownData.id);
  } else {
    activeIDs = problemSolutionContext!.modulesThatHaveProblem.map(x => x.id);
  }

  return (
    <MarkdownLayoutContext.Provider
      value={{
        markdownLayoutInfo: markdownData,
        sidebarLinks: moduleLinks,
        activeIDs,
        uniqueID: null, // legacy, remove when classes is removed
        isMobileNavOpen,
        setIsMobileNavOpen,
        moduleProgress,
        handleCompletionChange,
      }}
    >
      <ContactUsSlideoverProvider>
        <ProblemSuggestionModalProvider>
          <MobileSideNav />
          <DesktopSidebar />

          <div className="w-full">
            <MobileAppBar />

            <ContentContainer tableOfContents={tableOfContents}>
              <NotSignedInWarning />

              <ModuleHeaders moduleLinks={moduleLinks} />

              <div className={tableOfContents.length > 1 ? '2xl:hidden' : ''}>
                <TableOfContentsBlock tableOfContents={tableOfContents} />
              </div>

              {children}

              <ModuleProgressUpdateBanner />

              <ForumCTA />

              {/*<div className="my-8">*/}
              {/*  <ModuleFeedback markdownData={markdownData} />*/}
              {/*</div>*/}
            </ContentContainer>
          </div>
        </ProblemSuggestionModalProvider>
      </ContactUsSlideoverProvider>
    </MarkdownLayoutContext.Provider>
  );
}
