import React, { useState, useEffect } from 'react';
import styled from 'styled-components/native';
import { MobileHeader } from '../src/components/common/MobileHeader';
import { theme } from '../src/styles/theme';
import {
    View,
    FlatList,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${props => props.theme.colors.background.default};
`;

const PostCard = styled.View`
  background-color: ${props => props.theme.colors.background.paper};
  margin-bottom: 12px;
  padding: 16px;
  border-bottom-width: 1px;
  border-bottom-color: ${props => props.theme.colors.border.muted};
`;

const PostHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

const UserAvatar = styled.Image`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #eee;
`;

const UserInfo = styled.View`
  margin-left: 12px;
  flex: 1;
`;

const Name = styled.Text`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.text.primary};
`;

const Time = styled.Text`
  font-size: 12px;
  color: ${props => props.theme.colors.text.secondary};
`;

const PostContent = styled.Text`
  font-size: 15px;
  color: ${props => props.theme.colors.text.primary};
  line-height: 22px;
  margin-bottom: 12px;
`;

const PostImage = styled.Image`
  width: 100%;
  height: 250px;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const ActionsRow = styled.View`
  flex-direction: row;
  border-top-width: 1px;
  border-top-color: ${props => props.theme.colors.border.muted};
  padding-top: 12px;
`;

const ActionBtn = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: 24px;
`;

const ActionText = styled.Text`
  font-size: 14px;
  color: ${props => props.theme.colors.text.secondary};
  margin-left: 6px;
  font-weight: 600;
`;

export default function SocialScreen() {
    const [loading, setLoading] = useState(false);

    // Mock social data
    const posts = [
        {
            id: '1',
            user: 'Alex Ivanov',
            time: '2 hours ago',
            content: 'Just listed this beauty! Incredible performance and pristine condition. DM if interested. #KoliOne #BMW',
            image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80',
            likes: 24,
            comments: 5
        },
        {
            id: '2',
            user: 'Maria Petrova',
            time: '5 hours ago',
            content: 'Looking for a fuel-efficient city car. Any recommendations for Sofia driving?',
            image: null,
            likes: 12,
            comments: 18
        },
        {
            id: '3',
            user: 'Hristo Stoichkov',
            time: '1 day ago',
            content: 'Winter is coming! Make sure to check your tire pressure and antifreeze levels. Stay safe on the roads!',
            image: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80',
            likes: 156,
            comments: 24
        }
    ];

    return (
        <Container theme={theme}>
            <MobileHeader title="Social Feed" back />
            <FlatList
                data={posts}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <PostCard theme={theme}>
                        <PostHeader>
                            <UserAvatar source={{ uri: `https://ui-avatars.com/api/?name=${item.user}&background=random` }} />
                            <UserInfo>
                                <Name theme={theme}>{item.user}</Name>
                                <Time theme={theme}>{item.time}</Time>
                            </UserInfo>
                            <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.text.disabled} />
                        </PostHeader>

                        <PostContent theme={theme}>{item.content}</PostContent>

                        {item.image && (
                            <PostImage source={{ uri: item.image }} />
                        )}

                        <ActionsRow theme={theme}>
                            <ActionBtn>
                                <Ionicons name="heart-outline" size={20} color={theme.colors.text.secondary} />
                                <ActionText theme={theme}>{item.likes}</ActionText>
                            </ActionBtn>
                            <ActionBtn>
                                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.text.secondary} />
                                <ActionText theme={theme}>{item.comments}</ActionText>
                            </ActionBtn>
                            <ActionBtn>
                                <Ionicons name="share-social-outline" size={20} color={theme.colors.text.secondary} />
                                <ActionText theme={theme}>Share</ActionText>
                            </ActionBtn>
                        </ActionsRow>
                    </PostCard>
                )}
                contentContainerStyle={{ paddingVertical: 10 }}
            />
        </Container>
    );
}
