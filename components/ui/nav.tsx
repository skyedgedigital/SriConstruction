/** @format */

'use client';

import Link from 'next/link';
import { LucideIcon, ChevronDown } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { usePathname } from 'next/navigation';

interface NavProps {
  isCollapsed: boolean;
  links: (
    | {
        title: string;
        label?: string;
        icon?: LucideIcon;
        variant: 'default' | 'ghost';
        href?: string;
      }
    | {
        group: {
          title: string;
          icon?: LucideIcon;
          links: {
            title: string;
            label?: string;
            icon: LucideIcon;
            variant: 'default' | 'ghost';
            href: string;
          }[];
        };
      }
  )[];
}

function isGroupLink(
  link: NavProps['links'][number]
): link is { group: { title: string; icon?: LucideIcon; links: any[] } } {
  return 'group' in link;
}

export function Nav({ links, isCollapsed }: NavProps) {
  const pathName = usePathname();
  const [openGroups, setOpenGroups] = useState<number[]>([]);

  const toggleGroup = (index: number) => {
    setOpenGroups((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <TooltipProvider>
      <div
        data-collapsed={isCollapsed}
        className='group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2'
      >
        <nav className='grid gap-0  group-[[data-collapsed=true]]:justify-center'>
          {links.map((link, index) => {
            if (isGroupLink(link)) {
              const isOpen = openGroups.includes(index);
              return (
                <div key={index} className='space-y-1 flex flex-col my-1 '>
                  <button
                    onClick={() => toggleGroup(index)}
                    className='text-sm rounded   bg-blue-400 font-semibold text-white px-2 py-2 flex items-center justify-between hover:bg-gray-100 hover:text-black'
                  >
                    <div className='flex items-center pr-5'>
                      {link.group.icon && (
                        <link.group.icon className='mr-2 h-4 w-4 inline' />
                      )}
                      {!isCollapsed && link.group.title}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 transition-transform',
                          isOpen && 'transform rotate-180'
                        )}
                      />
                    )}
                  </button>
                  {isOpen && (
                    <div className='flex flex-col mt-2'>
                      {link.group.links.map((groupLink, groupIndex) => (
                        <Link
                          key={groupIndex}
                          href={groupLink.href}
                          className={cn(
                            buttonVariants({
                              variant:
                                groupLink.href === pathName
                                  ? 'default'
                                  : 'ghost',
                              size: 'sm',
                            }),
                            'ml-4',
                            groupLink.variant === 'ghost' && 'text-white',
                            'justify-start'
                          )}
                        >
                          {groupLink.icon && (
                            <groupLink.icon className='mr-2 h-4 w-4' />
                          )}{' '}
                          {!isCollapsed && groupLink.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return isCollapsed ? (
              <Tooltip key={index} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={isGroupLink(link) ? '#' : link.href}
                    className={cn(
                      buttonVariants({
                        variant: isGroupLink(link)
                          ? 'ghost'
                          : link.href === pathName
                          ? 'default'
                          : 'ghost',
                        size: 'icon',
                      }),
                      'h-9 w-9 relative flex items-center justify-center',
                      isGroupLink(link) ? 'text-gray-700' : '',
                      !isGroupLink(link) &&
                        link.variant === 'default' &&
                        'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                    )}
                  >
                    {isGroupLink(link) ? (
                      <ChevronDown
                        className={cn(
                          'h-5 w-5 transition-transform',
                          openGroups.includes(index) && 'transform rotate-180'
                        )}
                      />
                    ) : (
                      <link.icon className='h-4 w-4' />
                    )}
                    <span className='sr-only'>
                      {isGroupLink(link) ? link.group.title : link.title}
                    </span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side='right'
                  className='flex items-center gap-4 mt-2'
                >
                  {isGroupLink(link) ? link.group.title : link.title}
                  {!isGroupLink(link) && link.label && (
                    <span className='ml-auto text-muted-foreground'>
                      {link.label}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link
                key={index}
                href={isGroupLink(link) ? '#' : link.href}
                className={cn(
                  buttonVariants({
                    variant: isGroupLink(link)
                      ? 'ghost'
                      : link.href === pathName
                      ? 'default'
                      : 'ghost',
                    size: 'sm',
                  }),
                  'group' in link
                    ? ''
                    : link.variant === 'ghost' && 'text-white',
                  'group' in link
                    ? ''
                    : link.variant === 'default' &&
                        'dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white',
                  'justify-start'
                )}
              >
                {isGroupLink(link) ? null : (
                  <>
                    <link.icon className='mr-2 h-4 w-4' />
                    {link.title}
                    {link.label && (
                      <span
                        className={cn(
                          'ml-auto',
                          link.variant === 'default' &&
                            'text-background dark:text-white'
                        )}
                      >
                        {link.label}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
