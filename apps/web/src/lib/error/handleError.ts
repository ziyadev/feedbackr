import { ApolloError } from '@apollo/client';
import { toast } from '@/components/hooks';

export const handleApolloError = (error: ApolloError) => {
  toast({
    title: 'Error',
    description: error.message,
    variant: 'error',
    duration: 7000,
  });
};

export const handleGenericError = () => {
  toast({
    title: 'Error',
    description: 'Something went wrong, please try again later',
    variant: 'error',
    duration: 7000,
  });
};
