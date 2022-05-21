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
            },
            "cn/traditional": {
                "title": "狼人殺",
                "subtitle": "社會演繹、欺騙、團隊合作"
            },
            "en": {
                "title": "Chinese Werewolf",
                "subtitle": "Social Deduction, Deception, Teamwork, Co-op"
            }
        },
        "revealWerewolf": {
            "cn/simplified": {
                "title": "揭秘狼人杀",
                "subtitle": "娱乐、瓜",
            },
            "cn/traditional": {
                "title": "揭秘狼人殺",
                "subtitle": "娛樂、瓜"
            },
            "en": {
                "title": "Reveal Werewolf",
                "subtitle": "Entertainment, Exposed, Tea"
            }
        }
    }
}