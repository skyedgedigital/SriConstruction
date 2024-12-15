/** @format */
'use client';

import React, { forwardRef } from 'react';
import { Nav } from './ui/nav';
import {
  ChevronRight,
  LayoutDashboard,
  UsersRound,
  ContactRound,
  BriefcaseBusiness,
  ScrollText,
  FileStack,
  FileText,
  ClipboardPen,
  Forklift,
  Bolt,
  BoltIcon,
  HammerIcon,
  FuelIcon,
  List,
  BarChart,
  FileSliders,
  FileSignature,
  Landmark,
  ReceiptIndianRupee,
  DatabaseBackup,
  HandCoins,
  ChevronLeft,
  Settings,
  Upload,
  Database,
  Shield,
  TestTube,
  Wrench,
} from 'lucide-react';
import { Building } from 'lucide-react';
import { LocateFixed } from 'lucide-react';

import { Button } from './ui/button';
import { useSession } from 'next-auth/react';

type Props = {
  toggleSidebar: () => void;
  isCollapsed: boolean;
};

const Sidebar = forwardRef<HTMLDivElement, Props>(
  ({ toggleSidebar, isCollapsed }, ref) => {
    const session = useSession();

    return (
      <div
        ref={ref}
        className={`fixed top-16 min-w-[60px] bg-blue-500 border-t-[1px] border-t-white pt-8 px-1 z-50 bottom-0  ${
          isCollapsed ? 'w-[70px]' : ''
        }`}
      >
        <div className='absolute right-[-20px] top-7'>
          <Button
            onClick={toggleSidebar}
            variant='secondary'
            className=' rounded-full p-2'
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </Button>
        </div>

        {session?.data?.user?.access === 'ADMIN' && (
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Dashboard',
                href: '/admin/profile',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
              {
                title: 'Enterprise',
                href: '/admin/enterprise-management',
                icon: BriefcaseBusiness,
                variant: 'ghost',
              },
              {
                title: 'Employees',
                href: '/admin/employees',
                icon: UsersRound,
                variant: 'ghost',
              },
              {
                title: 'Engineers',
                href: '/admin/engineers',
                icon: ContactRound,
                variant: 'ghost',
              },
              {
                title: 'Invoice',
                href: '/admin/invoice-management',
                icon: FileText,
                variant: 'ghost',
              },
              {
                title: 'Analytics',
                href: '/admin/analytics',
                icon: BarChart,
                variant: 'ghost',
              },
              {
                title: 'Upload_File',
                href: '/admin/upload_file',
                icon: Upload,
                variant: 'ghost',
              },
              // {
              //   title: 'Emp Net Wages',
              //   href: '/admin/empCalenderYearWage',
              //   icon: List,
              //   variant: 'ghost',
              // },
            ]}
          />
        )}
        {session?.data?.user?.access === 'FLEETMANAGER' && (
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Dashboard',
                href: '/fleetmanager/profile',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
              {
                title: 'Chalans',
                href: '/fleetmanager/chalans',
                icon: ScrollText,
                variant: 'ghost',
              },
              {
                title: 'Invoice',
                href: '/fleetmanager/invoice-management',
                icon: FileText,
                variant: 'ghost',
              },
              {
                title: 'Merge Invoices',
                href: '/fleetmanager/merge-invoices',
                icon: FileStack,
                variant: 'ghost',
              },
              {
                title: 'Work Order',
                href: '/fleetmanager/work-order',
                icon: ClipboardPen,
                variant: 'ghost',
              },
              {
                title: 'Vehicle Settings',
                href: '/fleetmanager/vehicle-settings',
                icon: Forklift,
                variant: 'ghost',
              },

              {
                title: 'Consumables',
                href: '/fleetmanager/consumables',
                icon: BoltIcon,
                variant: 'ghost',
              },
              {
                title: 'Store Management',
                href: '/fleetmanager/StoreManagement',
                icon: HammerIcon,
                variant: 'ghost',
              },
              {
                title: 'Fuel Management',
                href: '/fleetmanager/fuelManagement',
                icon: FuelIcon,
                variant: 'ghost',
              },
              {
                title: 'Other Compliances',
                href: '/fleetmanager/otherCompliances',
                icon: List,
                variant: 'ghost',
              },
              {
                title: 'Daily Utilisation',
                href: '/fleetmanager/daily',
                icon: ClipboardPen,
                variant: 'ghost',
              },
              {
                title: 'Vehicle Report',
                href: '/fleetmanager/vehicle_Report',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
            ]}
          />
        )}
        {session?.data?.user?.access === 'DRIVER' && (
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Dashboard',
                href: '/driver/profile',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
              {
                title: 'Chalan',
                href: '/driver/chalan-management',
                icon: ScrollText,
                variant: 'ghost',
              },
              {
                title: 'Daily Utilisation',
                href: '/driver/daily',
                icon: ClipboardPen,
                variant: 'ghost',
              },
              {
                title: 'Setting',
                href: '/driver/settings',
                icon: Settings,
                variant: 'ghost',
              },
            ]}
          />
        )}
        {session?.data?.user?.access === 'Safety' && (
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Dashboard',
                href: '/safety/profile',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
              {
                title: 'Chemicals',
                href: '/safety/chem',
                icon: TestTube,
                variant: 'ghost',
              },
              {
                title: 'Emp',
                href: '/safety/emp',
                icon: UsersRound,
                variant: 'ghost',
              },
              {
                title: 'Tools',
                href: '/safety/tools',
                icon: Wrench,
                variant: 'ghost',
              },
              {
                title: 'PPE',
                href: '/safety/ppe',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
            ]}
          />
        )}
        {session?.data?.user?.access === 'HR' && (
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: 'Dashboard',
                href: '/hr/profile',
                icon: LayoutDashboard,
                variant: 'ghost',
              },
              {
                title: 'CLM',
                href: '/hr/CLM',
                icon: DatabaseBackup,
                variant: 'ghost',
              },
              {
                title: 'Checklist and Register',
                href: '/hr/payments',
                icon: ReceiptIndianRupee,
                variant: 'ghost',
              },
              {
                title: 'PF ESIC',
                href: '/hr/pf-esic-BankStatement',
                icon: ReceiptIndianRupee,
                variant: 'ghost',
              },
              {
                title: 'Bank Statements',
                href: '/hr/statements',
                icon: FileText,
                variant: 'ghost',
              },
              {
                title: 'Compliance and Register',
                href: '/hr/compliance-and-Register',
                icon: Bolt,
                variant: 'ghost',
              },
              {
                title: 'Arrear Generator',
                href: '/hr/Arrear',
                icon: HandCoins,
                variant: 'ghost',
              },
              {
                group: {
                  title: 'Master Data',
                  icon: Database,
                  links: [
                    {
                      title: 'Employee Data',
                      href: '/hr/EmployeeData',
                      icon: UsersRound,
                      variant: 'ghost',
                    },
                    {
                      title: 'Banks',
                      href: '/hr/bank',
                      icon: Landmark,
                      variant: 'ghost',
                    },
                    {
                      title: 'Department',
                      href: '/hr/department',
                      icon: Building,
                      variant: 'ghost',
                    },
                    {
                      title: 'Designation',
                      href: '/hr/Designation',
                      icon: FileSignature,
                      variant: 'ghost',
                    },
                    {
                      title: 'WorkOrder',
                      href: '/hr/workOrder',
                      icon: FileSignature,
                      variant: 'ghost',
                    },
                    {
                      title: 'Site Master',
                      href: '/hr/siteMaster',
                      icon: BriefcaseBusiness,
                      variant: 'ghost',
                    },
                    {
                      title: 'Esi Location',
                      href: '/hr/EsiLocation',
                      icon: LocateFixed,
                      variant: 'ghost',
                    },
                    {
                      title: 'State Wise Section',
                      href: '/hr/state-wise-section',
                      icon: FileSliders,
                      variant: 'ghost',
                    },
                  ],
                },
              },
            ]}
          />
        )}
      </div>
    );
  }
);

// Add display name for the component
Sidebar.displayName = 'Sidebar';

export default Sidebar;
