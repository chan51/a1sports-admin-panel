export const demoJson: any = {
  chatLinks: {
    message: 'No chat links found.',
  },
  chatFiles: {
    keys: ['1st October 2020', '29th January 2020'],
    status: true,
    files: {
      '1st October 2020': [
        {
          type: 'video',
          filePath: '/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          createdAt: 1601490600000,
          updatedAt: 1602268200000,
          id: '5f7a0f4f4a2dff27d5e5f8f7',
          videoStatus: 'live',
          userId: {
            id: '5f707ab02940a329336d05e2',
            firstName: 'user',
            lastName: '1',
          },
        },
      ],
      '29th January 2020': [
        {
          type: 'video',
          canList: false,
          filePath: '/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
          createdAt: 1580280100000,
          updatedAt: 1590280100000,
          id: '5f7cbd41eefc84883eece160',
          videoStatus: 'awaiting',
          userId: {
            id: '5f707ab02940a329336d05e2',
            firstName: 'Austin',
            lastName: '1',
          },
        },
      ],
    },
    allFiles: [
      {
        type: 'video',
        filePath: '/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        createdAt: 1601490600000,
        updatedAt: 1602268200000,
        id: '5f7a0f4f4a2dff27d5e5f8f7',
        videoStatus: 'awaiting',
        userId: {
          id: '5f707ab02940a329336d05e2',
          firstName: 'Dany',
          lastName: '1',
        },
      },
      {
        type: 'video',
        canList: false,
        filePath: '/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        createdAt: 1580280100000,
        updatedAt: 1590280100000,
        id: '5f7cbd41eefc84883eece160',
        videoStatus: 'live',
        userId: {
          id: '5f707ab02940a329336d05e2',
          firstName: 'Molly',
          lastName: '1',
        },
      },
      {
        createdAt: 1580280100000,
        filePath: '/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        id: '5f7c4b3deefc84883eece15f',
        reported: true,
        type: 'video',
        updatedAt: 1590280100000,
        videoStatus: 'reject',
        userId: {
          id: '5f707ab02940a329336d05e2',
          firstName: 'Dany',
          lastName: '1',
        },
      },
    ],
  },
  status: true,
};
