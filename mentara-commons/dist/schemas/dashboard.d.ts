import { z } from "zod";
export declare const ClientDashboardResponseDtoSchema: z.ZodObject<{
    client: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodNullable<z.ZodString>;
            lastName: z.ZodNullable<z.ZodString>;
            role: z.ZodString;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        }, {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        }>;
        assignedTherapists: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            clientId: z.ZodString;
            therapistId: z.ZodString;
            status: z.ZodString;
            createdAt: z.ZodString;
            therapist: z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                specialties: z.ZodArray<z.ZodString, "many">;
                user: z.ZodObject<{
                    id: z.ZodString;
                    email: z.ZodString;
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                }, {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            }, {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }, {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }>, "many">;
        meetings: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            clientId: z.ZodString;
            therapistId: z.ZodString;
            startTime: z.ZodString;
            endTime: z.ZodString;
            status: z.ZodString;
            therapist: z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                user: z.ZodObject<{
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    firstName: string | null;
                    lastName: string | null;
                }, {
                    firstName: string | null;
                    lastName: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }, {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }, {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }>, "many">;
        worksheets: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            clientId: z.ZodString;
            therapistId: z.ZodString;
            title: z.ZodString;
            status: z.ZodString;
            dueDate: z.ZodNullable<z.ZodString>;
            therapist: z.ZodObject<{
                user: z.ZodObject<{
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    firstName: string | null;
                    lastName: string | null;
                }, {
                    firstName: string | null;
                    lastName: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }, {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }>, "many">;
        preAssessment: z.ZodNullable<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        user: {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedTherapists: {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }[];
        preAssessment?: any;
    }, {
        id: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        user: {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedTherapists: {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }[];
        preAssessment?: any;
    }>;
    stats: z.ZodObject<{
        completedMeetings: z.ZodNumber;
        completedWorksheets: z.ZodNumber;
        upcomingMeetings: z.ZodNumber;
        pendingWorksheets: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        completedMeetings: number;
        completedWorksheets: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    }, {
        completedMeetings: number;
        completedWorksheets: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    }>;
    upcomingMeetings: z.ZodArray<z.ZodAny, "many">;
    pendingWorksheets: z.ZodArray<z.ZodAny, "many">;
    assignedTherapists: z.ZodArray<z.ZodAny, "many">;
    recentActivity: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        title: z.ZodString;
        content: z.ZodString;
        createdAt: z.ZodString;
        userId: z.ZodString;
        room: z.ZodNullable<z.ZodObject<{
            id: z.ZodString;
            roomGroup: z.ZodNullable<z.ZodObject<{
                community: z.ZodObject<{
                    id: z.ZodString;
                    name: z.ZodString;
                }, "strip", z.ZodTypeAny, {
                    id: string;
                    name: string;
                }, {
                    id: string;
                    name: string;
                }>;
            }, "strip", z.ZodTypeAny, {
                community: {
                    id: string;
                    name: string;
                };
            }, {
                community: {
                    id: string;
                    name: string;
                };
            }>>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        }, {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        }>>;
        _count: z.ZodObject<{
            hearts: z.ZodNumber;
            comments: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            comments: number;
            hearts: number;
        }, {
            comments: number;
            hearts: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
        content: string;
        createdAt: string;
        title: string;
        room: {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        } | null;
        _count: {
            comments: number;
            hearts: number;
        };
    }, {
        id: string;
        userId: string;
        content: string;
        createdAt: string;
        title: string;
        room: {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        } | null;
        _count: {
            comments: number;
            hearts: number;
        };
    }>, "many">;
    hasPreAssessment: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    client: {
        id: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        user: {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedTherapists: {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }[];
        preAssessment?: any;
    };
    recentActivity: {
        id: string;
        userId: string;
        content: string;
        createdAt: string;
        title: string;
        room: {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        } | null;
        _count: {
            comments: number;
            hearts: number;
        };
    }[];
    assignedTherapists: any[];
    stats: {
        completedMeetings: number;
        completedWorksheets: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    };
    upcomingMeetings: any[];
    pendingWorksheets: any[];
    hasPreAssessment: boolean;
}, {
    client: {
        id: string;
        userId: string;
        createdAt: string;
        updatedAt: string;
        user: {
            id: string;
            createdAt: string;
            role: string;
            updatedAt: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            therapist: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            endTime: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedTherapists: {
            id: string;
            status: string;
            createdAt: string;
            therapistId: string;
            therapist: {
                id: string;
                userId: string;
                user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                };
                specialties: string[];
            };
            clientId: string;
        }[];
        preAssessment?: any;
    };
    recentActivity: {
        id: string;
        userId: string;
        content: string;
        createdAt: string;
        title: string;
        room: {
            id: string;
            roomGroup: {
                community: {
                    id: string;
                    name: string;
                };
            } | null;
        } | null;
        _count: {
            comments: number;
            hearts: number;
        };
    }[];
    assignedTherapists: any[];
    stats: {
        completedMeetings: number;
        completedWorksheets: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    };
    upcomingMeetings: any[];
    pendingWorksheets: any[];
    hasPreAssessment: boolean;
}>;
export declare const TherapistDashboardResponseDtoSchema: z.ZodObject<{
    therapist: z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        user: z.ZodObject<{
            id: z.ZodString;
            email: z.ZodString;
            firstName: z.ZodNullable<z.ZodString>;
            lastName: z.ZodNullable<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        }, {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        }>;
        assignedClients: z.ZodArray<z.ZodObject<{
            client: z.ZodObject<{
                id: z.ZodString;
                userId: z.ZodString;
                user: z.ZodObject<{
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    firstName: string | null;
                    lastName: string | null;
                }, {
                    firstName: string | null;
                    lastName: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }, {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }, {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }>, "many">;
        meetings: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            clientId: z.ZodString;
            therapistId: z.ZodString;
            startTime: z.ZodString;
            status: z.ZodString;
            client: z.ZodObject<{
                user: z.ZodObject<{
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    firstName: string | null;
                    lastName: string | null;
                }, {
                    firstName: string | null;
                    lastName: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }, {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }>, "many">;
        worksheets: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            clientId: z.ZodString;
            therapistId: z.ZodString;
            title: z.ZodString;
            status: z.ZodString;
            dueDate: z.ZodNullable<z.ZodString>;
            client: z.ZodObject<{
                user: z.ZodObject<{
                    firstName: z.ZodNullable<z.ZodString>;
                    lastName: z.ZodNullable<z.ZodString>;
                }, "strip", z.ZodTypeAny, {
                    firstName: string | null;
                    lastName: string | null;
                }, {
                    firstName: string | null;
                    lastName: string | null;
                }>;
            }, "strip", z.ZodTypeAny, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }, {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }, {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        userId: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedClients: {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }[];
    }, {
        id: string;
        userId: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedClients: {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }[];
    }>;
    stats: z.ZodObject<{
        totalClients: z.ZodNumber;
        completedMeetings: z.ZodNumber;
        upcomingMeetings: z.ZodNumber;
        pendingWorksheets: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalClients: number;
        completedMeetings: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    }, {
        totalClients: number;
        completedMeetings: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    }>;
    upcomingMeetings: z.ZodArray<z.ZodAny, "many">;
    assignedClients: z.ZodArray<z.ZodAny, "many">;
    pendingWorksheets: z.ZodArray<z.ZodAny, "many">;
    recentSessions: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        clientId: z.ZodString;
        therapistId: z.ZodString;
        startTime: z.ZodString;
        status: z.ZodString;
        client: z.ZodObject<{
            user: z.ZodObject<{
                firstName: z.ZodNullable<z.ZodString>;
                lastName: z.ZodNullable<z.ZodString>;
            }, "strip", z.ZodTypeAny, {
                firstName: string | null;
                lastName: string | null;
            }, {
                firstName: string | null;
                lastName: string | null;
            }>;
        }, "strip", z.ZodTypeAny, {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        }, {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        }>;
        meetingNotes: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            createdAt: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            createdAt: string;
        }, {
            id: string;
            content: string;
            createdAt: string;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        therapistId: string;
        startTime: string;
        client: {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        };
        clientId: string;
        meetingNotes: {
            id: string;
            content: string;
            createdAt: string;
        }[];
    }, {
        id: string;
        status: string;
        therapistId: string;
        startTime: string;
        client: {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        };
        clientId: string;
        meetingNotes: {
            id: string;
            content: string;
            createdAt: string;
        }[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    therapist: {
        id: string;
        userId: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedClients: {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }[];
    };
    stats: {
        totalClients: number;
        completedMeetings: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    };
    upcomingMeetings: any[];
    pendingWorksheets: any[];
    assignedClients: any[];
    recentSessions: {
        id: string;
        status: string;
        therapistId: string;
        startTime: string;
        client: {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        };
        clientId: string;
        meetingNotes: {
            id: string;
            content: string;
            createdAt: string;
        }[];
    }[];
}, {
    therapist: {
        id: string;
        userId: string;
        user: {
            id: string;
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
        worksheets: {
            id: string;
            status: string;
            title: string;
            therapistId: string;
            dueDate: string | null;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        meetings: {
            id: string;
            status: string;
            therapistId: string;
            startTime: string;
            client: {
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
            clientId: string;
        }[];
        assignedClients: {
            client: {
                id: string;
                userId: string;
                user: {
                    firstName: string | null;
                    lastName: string | null;
                };
            };
        }[];
    };
    stats: {
        totalClients: number;
        completedMeetings: number;
        upcomingMeetings: number;
        pendingWorksheets: number;
    };
    upcomingMeetings: any[];
    pendingWorksheets: any[];
    assignedClients: any[];
    recentSessions: {
        id: string;
        status: string;
        therapistId: string;
        startTime: string;
        client: {
            user: {
                firstName: string | null;
                lastName: string | null;
            };
        };
        clientId: string;
        meetingNotes: {
            id: string;
            content: string;
            createdAt: string;
        }[];
    }[];
}>;
export declare const AdminDashboardResponseDtoSchema: z.ZodObject<{
    stats: z.ZodObject<{
        totalUsers: z.ZodNumber;
        totalClients: z.ZodNumber;
        totalTherapists: z.ZodNumber;
        pendingTherapists: z.ZodNumber;
        totalMeetings: z.ZodNumber;
        completedMeetings: z.ZodNumber;
        totalCommunities: z.ZodNumber;
        totalPosts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalUsers: number;
        totalTherapists: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
        completedMeetings: number;
        pendingTherapists: number;
        totalMeetings: number;
    }, {
        totalUsers: number;
        totalTherapists: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
        completedMeetings: number;
        pendingTherapists: number;
        totalMeetings: number;
    }>;
    recentUsers: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        firstName: z.ZodNullable<z.ZodString>;
        lastName: z.ZodNullable<z.ZodString>;
        role: z.ZodString;
        createdAt: z.ZodString;
        client: z.ZodNullable<z.ZodAny>;
        therapist: z.ZodNullable<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        client?: any;
        therapist?: any;
    }, {
        id: string;
        createdAt: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        client?: any;
        therapist?: any;
    }>, "many">;
    pendingApplications: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        userId: z.ZodString;
        status: z.ZodString;
        createdAt: z.ZodString;
        specialties: z.ZodArray<z.ZodString, "many">;
        user: z.ZodObject<{
            firstName: z.ZodNullable<z.ZodString>;
            lastName: z.ZodNullable<z.ZodString>;
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            firstName: string | null;
            lastName: string | null;
            email: string;
        }, {
            firstName: string | null;
            lastName: string | null;
            email: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        status: string;
        userId: string;
        createdAt: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
    }, {
        id: string;
        status: string;
        userId: string;
        createdAt: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    pendingApplications: {
        id: string;
        status: string;
        userId: string;
        createdAt: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
    }[];
    stats: {
        totalUsers: number;
        totalTherapists: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
        completedMeetings: number;
        pendingTherapists: number;
        totalMeetings: number;
    };
    recentUsers: {
        id: string;
        createdAt: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        client?: any;
        therapist?: any;
    }[];
}, {
    pendingApplications: {
        id: string;
        status: string;
        userId: string;
        createdAt: string;
        user: {
            firstName: string | null;
            lastName: string | null;
            email: string;
        };
        specialties: string[];
    }[];
    stats: {
        totalUsers: number;
        totalTherapists: number;
        totalClients: number;
        totalCommunities: number;
        totalPosts: number;
        completedMeetings: number;
        pendingTherapists: number;
        totalMeetings: number;
    };
    recentUsers: {
        id: string;
        createdAt: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
        client?: any;
        therapist?: any;
    }[];
}>;
export declare const ModeratorDashboardResponseDtoSchema: z.ZodObject<{
    moderator: z.ZodObject<{
        id: z.ZodString;
        firstName: z.ZodNullable<z.ZodString>;
        lastName: z.ZodNullable<z.ZodString>;
        email: z.ZodString;
        role: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    }, {
        id: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    }>;
    stats: z.ZodObject<{
        pendingReports: z.ZodNumber;
        pendingContent: z.ZodNumber;
        resolvedToday: z.ZodNumber;
        flaggedUsers: z.ZodNumber;
        systemAlerts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        systemAlerts: number;
        pendingReports: number;
        resolvedToday: number;
        pendingContent: number;
        flaggedUsers: number;
    }, {
        systemAlerts: number;
        pendingReports: number;
        resolvedToday: number;
        pendingContent: number;
        flaggedUsers: number;
    }>;
    communityStats: z.ZodObject<{
        totalCommunities: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        totalCommunities: number;
    }, {
        totalCommunities: number;
    }>;
    flaggedContent: z.ZodObject<{
        posts: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            content: z.ZodString;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            user: z.ZodObject<{
                firstName: z.ZodNullable<z.ZodString>;
                lastName: z.ZodNullable<z.ZodString>;
                email: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                firstName: string | null;
                lastName: string | null;
                email: string;
            }, {
                firstName: string | null;
                lastName: string | null;
                email: string;
            }>;
            room: z.ZodNullable<z.ZodObject<{
                roomGroup: z.ZodNullable<z.ZodObject<{
                    community: z.ZodObject<{
                        id: z.ZodString;
                        name: z.ZodString;
                    }, "strip", z.ZodTypeAny, {
                        id: string;
                        name: string;
                    }, {
                        id: string;
                        name: string;
                    }>;
                }, "strip", z.ZodTypeAny, {
                    community: {
                        id: string;
                        name: string;
                    };
                }, {
                    community: {
                        id: string;
                        name: string;
                    };
                }>>;
            }, "strip", z.ZodTypeAny, {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            }, {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            }>>;
            _count: z.ZodObject<{
                hearts: z.ZodNumber;
                comments: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                comments: number;
                hearts: number;
            }, {
                comments: number;
                hearts: number;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }, {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }>, "many">;
        comments: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            content: z.ZodString;
            createdAt: z.ZodString;
            updatedAt: z.ZodString;
            user: z.ZodObject<{
                firstName: z.ZodNullable<z.ZodString>;
                lastName: z.ZodNullable<z.ZodString>;
                email: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                firstName: string | null;
                lastName: string | null;
                email: string;
            }, {
                firstName: string | null;
                lastName: string | null;
                email: string;
            }>;
            post: z.ZodObject<{
                title: z.ZodString;
                id: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                id: string;
                title: string;
            }, {
                id: string;
                title: string;
            }>;
        }, "strip", z.ZodTypeAny, {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }, {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        posts: {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }[];
        comments: {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }[];
    }, {
        posts: {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }[];
        comments: {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }[];
    }>;
    recentActivity: z.ZodObject<{
        moderationActions: z.ZodArray<z.ZodAny, "many">;
    }, "strip", z.ZodTypeAny, {
        moderationActions: any[];
    }, {
        moderationActions: any[];
    }>;
}, "strip", z.ZodTypeAny, {
    moderator: {
        id: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
    recentActivity: {
        moderationActions: any[];
    };
    flaggedContent: {
        posts: {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }[];
        comments: {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }[];
    };
    stats: {
        systemAlerts: number;
        pendingReports: number;
        resolvedToday: number;
        pendingContent: number;
        flaggedUsers: number;
    };
    communityStats: {
        totalCommunities: number;
    };
}, {
    moderator: {
        id: string;
        role: string;
        firstName: string | null;
        lastName: string | null;
        email: string;
    };
    recentActivity: {
        moderationActions: any[];
    };
    flaggedContent: {
        posts: {
            id: string;
            content: string;
            createdAt: string;
            title: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            room: {
                roomGroup: {
                    community: {
                        id: string;
                        name: string;
                    };
                } | null;
            } | null;
            _count: {
                comments: number;
                hearts: number;
            };
        }[];
        comments: {
            id: string;
            content: string;
            createdAt: string;
            updatedAt: string;
            user: {
                firstName: string | null;
                lastName: string | null;
                email: string;
            };
            post: {
                id: string;
                title: string;
            };
        }[];
    };
    stats: {
        systemAlerts: number;
        pendingReports: number;
        resolvedToday: number;
        pendingContent: number;
        flaggedUsers: number;
    };
    communityStats: {
        totalCommunities: number;
    };
}>;
export type ClientDashboardResponseDto = z.infer<typeof ClientDashboardResponseDtoSchema>;
export type TherapistDashboardResponseDto = z.infer<typeof TherapistDashboardResponseDtoSchema>;
export type AdminDashboardResponseDto = z.infer<typeof AdminDashboardResponseDtoSchema>;
export type ModeratorDashboardResponseDto = z.infer<typeof ModeratorDashboardResponseDtoSchema>;
//# sourceMappingURL=dashboard.d.ts.map