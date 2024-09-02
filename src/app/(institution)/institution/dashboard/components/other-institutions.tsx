import React from 'react'

const institutions = [
    {
        name: "University of Oxford",
        location: "New York, USA",
        logo: "wb.webp",
        type: "University",
    },
    {
        name: "Harvard University",
        location: "London, UK",
        logo: "wb.webp",
        type: "College",
    },
    {
        name: "Stanford University",
        location: "Sydney, Australia",
        logo: "wb.webp",
        type: "Institute",
    },
    {
        name: "Yale University",
        location: "Tokyo, Japan",
        logo: "wb.webp",
        type: "University",
    },
    {
        name: "Columbia University",
        location: "Berlin, Germany",
        logo: "wb.webp",
        type: "College",
    },
]

function OtherInstitutions() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {institutions.map((institution, index) => (
                <div
                    key={index}
                    className="border border-white rounded-md py-4 shadow-sm shadow-white overflow-hidden"
                >
                    <div className="text-center">
                        <img
                            className="rounded-full size-12 mx-auto"
                            src={`/images/features/${institution.logo}`}
                            alt=""
                        />
                        <h3 className="mt-2 font-medium">{institution.name}</h3>
                    </div>
                    <div className="border-t border-white my-3"></div>
                    <div className="flex space-x-2 justify-center">
                        <h4 className="text-gray-300 text-sm">{institution.location}</h4>
                        <span className="text-gray-300 text-sm">-</span>
                        <h4 className="text-gray-300 text-sm">{institution.type}</h4>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default OtherInstitutions
