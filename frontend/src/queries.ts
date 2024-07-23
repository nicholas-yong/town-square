import { gql } from '@apollo/client';

export const getAllPosts = gql`
    query Posts {
        posts {
            _id
            title
            content
            order
        }
    }
`;
