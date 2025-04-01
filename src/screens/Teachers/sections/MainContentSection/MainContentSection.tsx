import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "../../../../components/ui/table";

export const MainContentSection = (): JSX.Element => {
  // Data for teachers to enable mapping
  const teachers = [
    {
      id: 1,
      name: "Kristin Watson",
      subject: "Chemistry",
      class: "J SS 2",
      email: "michelle.rivera@example.com",
      gender: "Female",
      avatar: "/ellipse-14.png",
    },
    {
      id: 2,
      name: "Marvin McKinney",
      subject: "French",
      class: "JSS 3",
      email: "debbie.baker@example.com",
      gender: "Female",
      avatar: "/ellipse-14-1.png",
    },
    {
      id: 3,
      name: "Jane Cooper",
      subject: "Maths",
      class: "JSS 3",
      email: "kenzi.lawson@example.com",
      gender: "Female",
      avatar: "/ellipse-14-11.png",
    },
    {
      id: 4,
      name: "Cody Fisher",
      subject: "English",
      class: "SS 3",
      email: "nathan.roberts@example.com",
      gender: "Female",
      avatar: "/ellipse-14-3.png",
    },
    {
      id: 5,
      name: "Bessie Cooper",
      subject: "Social studies",
      class: "SS 3",
      email: "felicia.reid@example.com",
      gender: "Male",
      avatar: "/ellipse-14-12.png",
    },
    {
      id: 6,
      name: "Leslie Alexander",
      subject: "Home economics",
      class: "SS 3",
      email: "tim.jennings@example.com",
      gender: "Male",
      avatar: "/ellipse-14-5.png",
    },
    {
      id: 7,
      name: "Guy Hawkins",
      subject: "Geography",
      class: "JSS 1",
      email: "alma.lawson@example.com",
      gender: "Male",
      avatar: "/ellipse-14-6.png",
    },
    {
      id: 8,
      name: "Theresa Webb",
      subject: "Pschology",
      class: "JSS 3",
      email: "debra.holt@example.com",
      gender: "Female",
      avatar: "/ellipse-14-7.png",
    },
    {
      id: 9,
      name: "Jerome Bell",
      subject: "Physic",
      class: "J SS 4",
      email: "deanna.curtis@example.com",
      gender: "Male",
      avatar: "/ellipse-14-8.png",
    },
    {
      id: 10,
      name: "Savannah Nguyen",
      subject: "Accounting",
      class: "J SS 4",
      email: "georgia.young@example.com",
      gender: "Female",
      avatar: "/ellipse-14-9.png",
    },
    {
      id: 11,
      name: "Wade Warren",
      subject: "C.R.s",
      class: "JSS 5",
      email: "jackson.graham@example.com",
      gender: "Male",
      avatar: "/ellipse-14-10.png",
    },
    {
      id: 12,
      name: "Annette Black",
      subject: "Politics",
      class: "JSS 1",
      email: "dolores.chambers@example.com",
      gender: "Female",
      avatar: "/ellipse-14-11.png",
    },
    {
      id: 13,
      name: "Darrell Steward",
      subject: "Entreprenuership",
      class: "SS 3",
      email: "willie.jennings@example.com",
      gender: "Male",
      avatar: "/ellipse-14-12.png",
    },
  ];

  return (
    <div className="flex flex-col w-full items-start mt-11">
      <Table>
        <TableBody>
          {teachers.map((teacher, index) => (
            <TableRow
              key={teacher.id}
              className={
                index % 2 === 0 ? "bg-white" : "bg-projectsecondary-10"
              }
            >
              <TableCell className="w-[180px] py-3 pl-2 pr-0">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={teacher.avatar}
                      alt={`${teacher.name} avatar`}
                    />
                    <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-grey-400 text-xs">
                    {teacher.name}
                  </span>
                </div>
              </TableCell>

              <TableCell className="w-36 py-4 pl-2 pr-0">
                <span className="font-medium text-grey-400 text-xs">
                  {teacher.subject}
                </span>
              </TableCell>

              <TableCell className="w-[164px] py-4 pl-2 pr-0">
                <span className="font-medium text-grey-400 text-xs">
                  {teacher.class}
                </span>
              </TableCell>

              <TableCell className="py-4 pl-2 pr-0">
                <span className="font-medium text-grey-400 text-xs">
                  {teacher.email}
                </span>
              </TableCell>

              <TableCell className="py-4 pl-2 pr-0">
                <span className="font-medium text-grey-400 text-xs">
                  {teacher.gender}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
