import Head from "next/head";
import { Inter } from "next/font/google";
import Table from "react-bootstrap/Table";
import { Alert, Container } from "react-bootstrap";
import { Pagination } from "react-bootstrap";
import { GetServerSideProps, GetServerSidePropsContext } from "next";
import { useState } from "react";

const inter = Inter({ subsets: ["latin"] });

type TUserItem = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  updatedAt: string
}

type TGetServerSideProps = {
  statusCode: number
  users: TUserItem[]
}


export const getServerSideProps = (async (ctx: GetServerSidePropsContext): Promise<{ props: TGetServerSideProps }> => {
  try {
    const res = await fetch("http://localhost:3000/users", { method: 'GET' })
    if (!res.ok) {
      return { props: { statusCode: res.status, users: [] } }
    }

    return {
      props: { statusCode: 200, users: await res.json() }
    }
  } catch (e) {
    return { props: { statusCode: 500, users: [] } }
  }
}) satisfies GetServerSideProps<TGetServerSideProps>


export default function Home({ statusCode, users }: TGetServerSideProps) {
  if (statusCode !== 200) {
    return <Alert variant={'danger'}>Ошибка {statusCode} при загрузке данных</Alert>
  }

  const [allUsers, setAllUsers] = useState([...users])
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage, setUsersPerPage] = useState(20)
  const [currentChunk, setCurrentChunk] = useState(1)

  const allPageCount = allUsers.length / 20;

  const lastUserIndex = currentPage * usersPerPage
  const firstUserIndex = lastUserIndex - usersPerPage
  const currentUser = users.slice(firstUserIndex, lastUserIndex)

  const paginate = pageNumber => {
    setCurrentPage(pageNumber)
  }

  let numbers = [];
  for (let i = currentChunk; i <= currentChunk + 9; i++) {
    numbers.push(i)
  }


  const nextPage = () => {
    setCurrentPage(currentChunk + 10)
    setCurrentChunk(currentChunk + 10)
    if (currentChunk > allPageCount - 10) {
      setCurrentPage(allPageCount)
      setCurrentChunk(allPageCount - 9)
    } 
  }

  const prevPage = () => {
    setCurrentPage(currentChunk - 10)
    setCurrentChunk(currentChunk - 10)
    if (currentChunk < 10) {
      setCurrentPage(1)
      setCurrentChunk(1)
    } 
  }

  numbers.map((number) =>
    <Pagination.Item>{number}</Pagination.Item>);


  return (
    <>
      <Head>
        <title>Тестовое задание</title>
        <meta name="description" content="Тестовое задание" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={inter.className}>
        <Container>
          <h1 className={'mb-5'}>Пользователи</h1>

          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Имя</th>
                <th>Фамилия</th>
                <th>Телефон</th>
                <th>Email</th>
                <th>Дата обновления</th>
              </tr>
            </thead>
            <tbody>
              {
                currentUser.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.firstname}</td>
                    <td>{user.lastname}</td>
                    <td>{user.phone}</td>
                    <td>{user.email}</td>
                    <td>{user.updatedAt}</td>
                  </tr>
                ))
              }
            </tbody>
          </Table>

          <Pagination>
            <Pagination.First onClick={() => { paginate(1), setCurrentChunk(1) }} />
            <Pagination.Prev onClick={prevPage} />

            {
              numbers.map((number) =>
                <Pagination.Item onClick={() => paginate(number)}>{number}</Pagination.Item>)
            }


            <Pagination.Next onClick={nextPage} />
            <Pagination.Last onClick={() => { paginate(allPageCount), setCurrentChunk(allPageCount - 9) }} />
          </Pagination>



        </Container>
      </main>
    </>
  );
}
