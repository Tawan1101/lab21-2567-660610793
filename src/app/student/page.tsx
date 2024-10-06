"use client";

import { $authenStore } from "@lib/authenStore";
import { Course } from "@lib/types";

import {
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";

import { useStore } from "@nanostores/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";

export default function StudentPage() {
  const [myEnrollments, setMyEnrollments] = useState<Course[] | null>(null);
  const [loadingMyEnrollments, setLoadingMyEnrollments] = useState(false);

  //const [loadingEnrolling, setLoadingEnrolling] = useState(false);
  const [loadingDropping, setLoadingDropping] = useState("");
  const [courseNo, setCourseNo] = useState("");
  const router = useRouter();

  const { token, authenUsername } = useStore($authenStore);

  const loadMyCourses = async () => {
    setLoadingMyEnrollments(true);
    const resp = await axios.get("/api/enrollments", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setMyEnrollments(resp.data.enrollments);
    setLoadingMyEnrollments(false);
  };

  useEffect(() => {
    loadMyCourses();
  }, []);

  const logout = () => {
    router.push("/");
    localStorage.removeItem("token");
    localStorage.removeItem("authenUsername");
  };

  const callEnrollApi = async () => {
    try {
      const resp = await axios.post(
        "/api/enrollments",
        {
          courseNo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCourseNo("");
      loadMyCourses();
    } catch (error) {
      // if (error.response) alert(error.response.data.message);
      // else alert(error.message);

      if (axios.isAxiosError(error)) {
        console.log(error.status);
        console.error(error.response);
        alert(error.response?.data.message);
        // Do something with this error...
      } else {
        console.error(error);
        alert(error);
      }
    }
  };

  const callDropApi = async (drop_courseNo: string) => {
    setLoadingDropping(drop_courseNo);
    try {
      const resp = await axios.delete("/api/enrollments", {
        data: {
          courseNo: drop_courseNo,
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      loadMyCourses();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.status);
        console.error(error.response);
        alert(error.response?.data.message);
        // Do something with this error...
      } else {
        console.error(error);
        alert(error);
      }
    }
    setLoadingDropping("");
  };

  return (
    <Stack>
      <Paper withBorder p="md">
        <Group>
          <Title order={4}>Hi, {authenUsername} </Title>
          <Button color="red" onClick={logout}>
            Logout
          </Button>
        </Group>
      </Paper>
      <Paper withBorder p="md">
        <Title order={4}>My Course(s)</Title>

        {myEnrollments &&
          myEnrollments.map((enroll: any) => (
            <Group my="xs" key={enroll.courseNo}>
              <Text>
                {enroll.courseNo} - {enroll.course.title}
              </Text>
              <Button
                color="red"
                size="xs"
                onClick={() => callDropApi(enroll.courseNo)}
                loading={enroll.courseNo === loadingDropping}
              >
                Drop
              </Button>
            </Group>
          ))}
        {myEnrollments && myEnrollments.length === 0 && (
          <Text color="dimmed" size="sm">
            You have not enrolled any course yet!
          </Text>
        )}
        {loadingMyEnrollments && <Loader type="dots" />}
      </Paper>

      <Paper withBorder p="md">
        <Title order={4}> Enroll a Course</Title>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            callEnrollApi();
          }}
        >
          <Group>
            <TextInput
              placeholder="6 Digits Course No."
              maxLength={6}
              minLength={6}
              pattern="^[0-9]*$"
              required
              onChange={(e) => setCourseNo(e.target.value)}
              value={courseNo}
            />
            <Button type="submit">Enroll</Button>
          </Group>
        </form>
      </Paper>
    </Stack>
  );
}