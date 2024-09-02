"use client"

import { Button } from '@/components/custom/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Layout, LayoutBody } from '@/components/custom/layout'
import { Overview } from './components/overview'
import { RecentOrders } from './components/recent-orders'
import StudentsList from './components/students-list'
import TranscriptStatus from './components/transcript-status'
import OtherInstitutions from './components/other-institutions'
import NotificationsFromStudents from './components/notifications-from-students'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getUserByEmail } from '@/actions/user'


/**
 * This page is being used to display several information including number of students, list of orders...
 * @returns JSX
 */
export default function Dashboard(): JSX.Element {

  /**
   * States..
   */
  const session = useSession()
  const [institutionId, setInstitutionId] = useState<number | null>(null)


  /**
   * Life cycle...
   */
  useEffect(() => {
    async function getInstitutionId() {
      try {
        if (session.data?.user.email) {
          const user = await getUserByEmail({ email: session.data.user.email })

          if (user) setInstitutionId(user.institutionId)
        }
      } catch (error) {
        console.error(error)
      }
    }

    getInstitutionId()
      .then(() => { })
      .catch(error => console.error(error))
  }, [session.data?.user.email])


  return (
    <Layout>
      {/* ===== Main ===== */}
      <LayoutBody className='space-y-4'>
        <div className='flex items-center justify-between space-y-2'>
          <h1 className='text-2xl font-bold tracking-tight md:text-3xl'>
            Dashboard
          </h1>
          <div className='flex items-center space-x-2'>
            <Button>Download</Button>
          </div>
        </div>
        <Tabs
          orientation='vertical'
          defaultValue='overview'
          className='space-y-4'
        >
          <div className='w-full pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='students'>Students</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Total Number of Students
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>4300</div>
                  <p className='text-xs text-muted-foreground'>
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Ordering Status
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                    <circle cx='9' cy='7' r='4' />
                    <path d='M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>123</div>
                  <p className='text-xs text-muted-foreground'>
                    +10.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>Sales</CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <rect width='20' height='14' x='2' y='5' rx='2' />
                    <path d='M2 10h20' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+12,234</div>
                  <p className='text-xs text-muted-foreground'>
                    +19% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    Active Now
                  </CardTitle>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    className='h-4 w-4 text-muted-foreground'
                  >
                    <path d='M22 12h-4l-3 9L9 3l-3 9H2' />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className='text-2xl font-bold'>+573</div>
                  <p className='text-xs text-muted-foreground'>
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
              <Card className='col-span-1 lg:col-span-4'>
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className='pl-2'>
                  <Overview />
                </CardContent>
              </Card>
              <Card className='col-span-1 lg:col-span-3'>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>
                    List of students who required order within past 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentOrders />
                </CardContent>
              </Card>
            </div>
            <div className='py-6 pt-12'>
              <h2 className='text-2xl text-white pb-4 font-bold'>Credentials Status:</h2>

              {/* TODO: catching institution id... */}
              <TranscriptStatus />
            </div>
            <div className='py-6'>
              <h2 className='text-2xl text-white pb-4 font-bold'>Other Institutions:</h2>
              <OtherInstitutions />
            </div>
            <div className='py-6 pb-16'>
              <h2 className='text-2xl text-white pb-4 font-bold'>Notifications From Students:</h2>
              <NotificationsFromStudents />
            </div>
          </TabsContent>
          <TabsContent value='students' className='space-y-4'>
            <StudentsList />
          </TabsContent>
        </Tabs>
      </LayoutBody>
    </Layout>
  )
}

const topNav = [
  {
    title: 'Overview',
    href: 'dashboard/overview',
    isActive: true,
  },
  {
    title: 'Customers',
    href: 'dashboard/customers',
    isActive: false,
  },
  {
    title: 'Products',
    href: 'dashboard/products',
    isActive: false,
  },
  {
    title: 'Settings',
    href: 'dashboard/settings',
    isActive: false,
  },
]
