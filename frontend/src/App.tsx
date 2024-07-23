import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import { gql, useMutation } from '@apollo/client';

export const GET_ALL_POSTS = gql`
    query Posts {
        posts {
            _id
            title
            content
            order
        }
    }
`;

export const UPDATE_ORDER = gql`
    mutation UpdatePostOrder($id: ID, $newOrder: Int) {
        updatePostOrder(id: $id, newOrder: $newOrder)
    }
`


type PostResponse = {
    posts: Array<Post>
}

type Post = {
    _id: string;
    title: string;
    content: string;
    order: number;
}

export const App: React.FC<{}> = () => {
    const { data } = useQuery<PostResponse>(GET_ALL_POSTS);
    const { posts } = data || { posts: [] };
    const [localPosts, setLocalPosts] = useState(posts);
    const [currentDraggedIndex, setCurrentDraggedIndex] = useState<number | null>(null);
    const [currentDraggedEnteredIndex, setCurrentDraggedEnteredIndex] = useState<number | null>(null);
    const [updateOrder] = useMutation(UPDATE_ORDER);

    useEffect(() => {
        setLocalPosts(posts)
    }, [posts])

    const movePost = () => {
        const localCopy = [...localPosts];

        if(Number.isFinite(currentDraggedIndex) && Number.isFinite(currentDraggedEnteredIndex)) {
            const typedDraggedIndex = currentDraggedIndex!
            const typedDraggedEnteredIndex = currentDraggedEnteredIndex!
            setLocalPosts(localCopy)
            // Get dragged post and remove from array
            const postToMove = localCopy.splice(typedDraggedIndex, 1)[0];
            localCopy.splice(typedDraggedEnteredIndex, 0, postToMove)
            Promise.all(localCopy.map((post, index) => updateOrder({
                    variables: {
                        id: post._id,
                        newOrder: index
                    }
                })
            ))            
        }
    }

    return (
        <Box display={'flex'} gap={4} flexDirection={'column'}>
            {localPosts && localPosts.length > 0 && localPosts.map((post, index) => (
                 <Card key={index} draggable onDragStart={_ => setCurrentDraggedIndex(index)} onDragEnter={_ => setCurrentDraggedEnteredIndex(index)} 
                 onDragEnd={movePost}>
                 <CardContent>
                 <Typography sx={{ fontSize: 24 }} color="text.secondary" gutterBottom>
                     {post.title}
                 </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {post.content}
                </Typography>
                 </CardContent>
             </Card>
            ))}       
        </Box>
    )
}
