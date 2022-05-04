export function localize(message: any, preference = "en"): any {
    if (message[preference] === undefined) {
        preference = "en";
    }
    return message[preference];
}

export const text = {
    "games": {
        "chineseWerewolf": {
            "cn/simplified": {
                "title": "狼人杀",
                "subtitle": "社会演绎、欺骗、团队合作",
                "cards": {
                    "town": {
                        "prophet": "预言家",
                        "witch": "女巫",
                        "bodyguard": "守卫",
                        "hunter": "猎人",
                        "citizen": "平民"
                    },
                    "wolves": {
                        "werewolf": "狼"
                    }
                }
            },
            "cn/traditional": {
                "title": "狼人殺",
                "subtitle": "社會演繹、欺騙、團隊合作"
            },
            "en": {
                "title": "Chinese Werewolf",
                "subtitle": "Social Deduction, Deception, Teamwork, Co-op"
            }
        }
    }
}