import { v4 as uuid } from "uuid";
import type { Collection, Environment } from "@/types";

export const defaultCollections: Collection[] = [
  {
    id: uuid(),
    name: "JSONPlaceholder",
    isOpen: true,
    requests: [
      {
        id: uuid(),
        name: "GET tous les posts",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts",
        headers: [],
        params: [],
        body: "",
        bodyType: "none",
        collectionId: null,
      },
      {
        id: uuid(),
        name: "GET post par ID",
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        headers: [],
        params: [],
        body: "",
        bodyType: "none",
        collectionId: null,
      },
      {
        id: uuid(),
        name: "POST créer un post",
        method: "POST",
        url: "https://jsonplaceholder.typicode.com/posts",
        headers: [
          {
            id: uuid(),
            key: "Content-Type",
            value: "application/json",
            enabled: true,
          },
        ],
        params: [],
        body: JSON.stringify(
          { title: "Mon titre", body: "Mon contenu", userId: 1 },
          null,
          2,
        ),
        bodyType: "json",
        collectionId: null,
      },
      {
        id: uuid(),
        name: "DELETE post",
        method: "DELETE",
        url: "https://jsonplaceholder.typicode.com/posts/1",
        headers: [],
        params: [],
        body: "",
        bodyType: "none",
        collectionId: null,
      },
    ],
  },
  {
    id: uuid(),
    name: "GitHub API",
    isOpen: false,
    requests: [
      {
        id: uuid(),
        name: "GET utilisateur",
        method: "GET",
        url: "https://api.github.com/users/{{username}}",
        headers: [
          {
            id: uuid(),
            key: "Accept",
            value: "application/vnd.github.v3+json",
            enabled: true,
          },
        ],
        params: [],
        body: "",
        bodyType: "none",
        collectionId: null,
      },
    ],
  },
];

export const defaultEnvironments: Environment[] = [
  {
    id: uuid(),
    name: "Production",
    variables: {
      base_url: "https://api.monsite.com",
      username: "octocat",
      token: "",
    },
  },
  {
    id: uuid(),
    name: "Développement",
    variables: {
      base_url: "http://localhost:3001",
      username: "test-user",
      token: "",
    },
  },
];
