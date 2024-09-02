"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { useToast } from "@/hooks/use-toast"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons"
import {
    InstitutionAccountFormInput,
    institutionAccountFormSchema
} from "@/validations/account"
import { createIssuerProfile, submitInstitutionAccountForm } from "@/actions/account"
import { useSession } from "next-auth/react"
import { getUserByEmail } from "@/actions/user"
import { Institution, InstitutionType } from "@prisma/client"
import { getInstitutionGenre, getInstitutions } from "@/actions/institutions"
import PhotoUploadForm, { PhotoUploadFormRef } from "./photo-upload-form"


/**
 * This is used to register or update a institution account...
 * 1. For the fresh user, it should be able to set a new profile with personal information.
 * 2. For an existing user, it should be able to guide to a relevant page and display the existing data.
 * 3. Using raw github content api, it should be able to create an issuer JSON profile which is available to host online with public url.
 * @returns JSX
 */
export function InstitutionAccountForm(): JSX.Element {
    /**
     * State...
     */
    const { toast } = useToast()
    const [isPending, startTransition] = React.useTransition()
    const photoFormRef = React.useRef<PhotoUploadFormRef>(null)

    const session = useSession()

    const [userData, setUserData] = React.useState<InstitutionAccountFormInput>({
        name: "",
        email: "",
        location: "",
        phone: "",
        genre: InstitutionType.SCHOOL,
        logo: ''
    })

    const [institutions, setInstitutions] = React.useState<Institution[]>([])

    const form = useForm<InstitutionAccountFormInput>({
        resolver: zodResolver(institutionAccountFormSchema),
        defaultValues: userData
    })

    /**
     * Life cycle...
     * This is used to update the user data to fill the blanks from session...
     * TODO: It should be updated with redux, it should be able to pass from a next auth middleware v5...
     */
    React.useEffect(() => {
        if (session.data?.user) {
            form.reset({
                name: session.data.user.name || "",
                email: session.data.user.email || ""
            })
        }
    }, [session.data, form])

    React.useEffect(() => {
        async function fetchUser() {
            const user = await getUserByEmail({ email: String(session.data?.user.email) })
            const genre = await getInstitutionGenre(user?.institutionId)

            setUserData({
                name: String(user?.name) || "",
                email: String(user?.email) || "",
                phone: String(user?.phone) || "",
                location: String(user?.address) || "",
                genre: genre || InstitutionType.SCHOOL,
                logo: String(user?.image)
            })
        }

        fetchUser()
    }, [session.data, form])

    React.useEffect(() => {
        form.reset(userData)
    }, [userData, form])


    React.useEffect(() => {
        async function fetchInstitutions() {
            const institutions = await getInstitutions()
            setInstitutions(institutions)
        }

        fetchInstitutions()
    }, [])


    /**
     * This function is used to submit form data with use hook form...
     * 1. Save the profile data to database by submitting.
     * 2. Here, an issuer profile should be created so that it can serves as online service with public link...
     * @param formData 
     */
    function onSubmit(formData: InstitutionAccountFormInput): void {
        startTransition(async () => {
            try {
                const data = await photoFormRef.current?.handlePhotoUpload()

                const message = await submitInstitutionAccountForm({
                    ...formData,
                    logo: data ? data?.filePath : "",
                    issuerUrl: "",
                    revocationList: ""
                })

                switch (message) {
                    case "success":
                        toast({
                            title: "Thank you!",
                            description: "Your message has been sent",
                        })
                        form.reset()
                        break
                    default:
                        toast({
                            title: "Something went wrong",
                            description: "Please try again",
                            variant: "destructive",
                        })
                }
            } catch (error) {
                toast({
                    description: "Something went wrong. Please try again",
                    variant: "destructive",
                })
            }
        })
    }

    return (
        <Form {...form}>
            <form
                className="grid w-full gap-8"
                onSubmit={(...args) => void form.handleSubmit(onSubmit)(...args)}
            >
                <div>
                    <PhotoUploadForm
                        ref={photoFormRef}
                        photo={userData.logo}
                    />
                </div>
                <div className="grid w-full gap-8 md:grid-cols-2 md:gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl className="h-10">
                                    <Input className="border-gray-400 border placeholder:text-gray-300" type="text" placeholder="John" {...field} />
                                </FormControl>
                                <FormMessage className="pt-2 sm:text-sm" />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem >
                                <FormLabel>Email</FormLabel>
                                <FormControl className="h-10">
                                    <Input className="border-gray-400 border placeholder:text-gray-300" type="email" placeholder="john@smith.com" {...field} />
                                </FormControl>
                                <FormMessage className="pt-2 sm:text-sm" />
                            </FormItem>
                        )}
                    />

                </div>

                <div className="grid w-full gap-8 md:grid-cols-2 md:gap-4">
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl className="h-10">
                                    <Input className="border-gray-400 border placeholder:text-gray-300" type="tel" placeholder="+1 (555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage className="pt-2 sm:text-sm" />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid w-full gap-8 md:grid-cols-2 md:gap-4">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl className="h-10">
                                    <Input className="border-gray-400 border placeholder:text-gray-300" type="text" placeholder="2618 Ocala Street Orlando Florida 32809 United States" {...field} />
                                </FormControl>
                                <FormMessage className="pt-2 sm:text-sm" />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="genre"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Genre</FormLabel>
                                <FormControl className="h-12">
                                    <Select value={String(field.value)} onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a genre" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(InstitutionType).map(([key, value]) => (
                                                <SelectItem key={value.toString()} value={key.toString()}>
                                                    {key.toString()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage className="pt-2 sm:text-sm" />
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    variant="outline"
                    className="h-14 border bg-gradient-to-br from-pink-600/70 to-purple-400/70 text-lg font-bold tracking-wide hover:opacity-70"
                >
                    {isPending && (
                        <Icons.spinner
                            className="mr-2 size-4 animate-spin"
                            aria-hidden="true"
                        />
                    )}
                    {isPending ? "Sending..." : "Send"}
                    <span className="sr-only">Submit contact form</span>
                </Button>
            </form>
        </Form>
    )
}
